import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAll, updateDocument } from "../../services/api";
import "../../static/css/accountOverview.css"; // reuse styles

export default function AccountEdit() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  // Choose collection solely from AuthContext
  const collection = useMemo(() => {
    if (!user) return "users";
    if (user.collection === "artists") return "artists";
    if (user.collection === "users") return "users";
    return user.role === "artist" ? "artists" : "users";
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doc, setDoc] = useState(null);
  const [form, setForm] = useState({});

  // Utility to fetch the freshest doc (always-200; no 404 logs)
  const findAccountDoc = async (collectionName, u) => {
    const fields = collectionName === "artists"
      ? ["username", "_id", "email"]
      : ["username", "email", "_id"];

    for (const f of fields) {
      const v = f === "_id" ? u?._id : u?.[f];
      if (!v) continue;
      const res = await getAll(collectionName, { filter: { [f]: v }, limit: 1 });
      const item = res?.items?.[0];
      if (item) return item;
    }
    return null;
  };

  // Build initial form from doc dynamically
  const buildInitialForm = (d, coll) => {
    if (!d) return {};
    const f = {};

    if (coll === "users") {
      // dynamic: only add fields that exist
      if ("username" in d) f.username = d.username ?? "";
      if ("email" in d) f.email = d.email ?? "";
      if ("subscription" in d) f.subscription = d.subscription ?? "";
      if (d.profile && typeof d.profile === "object") {
        if ("display_name" in d.profile) f["profile.display_name"] = d.profile.display_name ?? "";
        if ("avatar_url" in d.profile) f["profile.avatar_url"] = d.profile.avatar_url ?? "";
      }
      // arrays as comma-separated strings (still dynamic)
      if (Array.isArray(d.playlists)) f.playlists = d.playlists.join(", ");
      if (Array.isArray(d.followed_artists)) f.followed_artists = d.followed_artists.join(", ");
      if (Array.isArray(d.liked_tracks)) f.liked_tracks = d.liked_tracks.join(", ");
    } else {
      // artists
      if ("username" in d) f.username = d.username ?? "";
      if ("email" in d) f.email = d.email ?? "";
      if ("password" in d) f.password = d.password ?? "";
      if ("genre" in d) f.genre = d.genre ?? "";
      if ("biography" in d) f.biography = d.biography ?? "";
    }

    return f;
  };

  // Apply change to form (supports dotted paths like profile.display_name)
  const setFormPath = (path, value) => {
    setForm(prev => ({ ...prev, [path]: value }));
  };

  // Convert flat form back to nested update payload
  const toUpdatePayload = (formObj, coll) => {
    const out = {};
    const setNested = (root, dotted, val) => {
      const parts = dotted.split(".");
      let cur = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!(p in cur) || typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = val;
    };

    for (const [key, raw] of Object.entries(formObj)) {
      // arrays for user are comma-separated; convert back if relevant
      if (coll === "users" && (key === "playlists" || key === "followed_artists" || key === "liked_tracks")) {
        const arr = typeof raw === "string"
          ? raw.split(",").map(s => s.trim()).filter(Boolean)
          : Array.isArray(raw) ? raw : [];
        setNested(out, key, arr);
      } else {
        setNested(out, key, raw);
      }
    }

    // Never allow changing _id from the form
    return out;
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const fresh = await findAccountDoc(collection, user);
        if (!fresh) {
          setError("Impossible de charger le profil");
          setLoading(false);
          return;
        }

        setDoc(fresh);
        setForm(buildInitialForm(fresh, collection));
      } catch (e) {
        console.error(e);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, user?._id, user?.username, user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doc) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updates = toUpdatePayload(form, collection);

      // Option: only send changed fields vs doc to minimize writes
      // For simplicity, we send "updates" as built; backend should $set
      const res = await updateDocument(collection, doc._id, updates);

      // Update local view and AuthContext/localStorage if keys changed (username/email/profile)
      const newDoc = { ...doc };
      const applyNested = (root, dotted, val) => {
        const parts = dotted.split(".");
        let cur = root;
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i];
          if (!(p in cur) || typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
          cur = cur[p];
        }
        cur[parts[parts.length - 1]] = val;
      };
      for (const [k, v] of Object.entries(form)) applyNested(newDoc, k, v);
      setDoc(newDoc);

      // Try to refresh AuthContext if setter exists
      if (typeof setUser === "function") {
        setUser(prev => ({ ...(prev || {}), ...newDoc }));
      } else {
        // Fallback: sync localStorage user if present
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const prev = JSON.parse(stored);
            const merged = { ...(prev || {}), ...newDoc };
            localStorage.setItem("user", JSON.stringify(merged));
          }
        } catch {}
      }

      setSuccess("Profil mis à jour");
      // Navigate back after a short delay
      setTimeout(() => navigate("/account"), 600);
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="account-container">
        <div className="account-card">
          <p className="loading-text">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-container">
        <div className="account-card">
          <div className="error-message">{error}</div>
          <div style={{ marginTop: 12 }}>
            <button className="btn-edit" onClick={() => navigate("/account")}>Retour</button>
          </div>
        </div>
      </div>
    );
  }

  const isArtist = collection === "artists";

  // Render dynamic fields based on form keys
  const fieldOrder = Object.keys(form);

  const renderInput = (name, value) => {
    const label = (() => {
      switch (name) {
        case "username": return isArtist ? "Nom d'artiste" : "Nom d'utilisateur";
        case "email": return "Email";
        case "password": return "Mot de passe";
        case "genre": return "Genre";
        case "biography": return "Biographie";
        case "subscription": return "Abonnement";
        case "profile.display_name": return "Nom d'affichage";
        case "profile.avatar_url": return "Avatar URL";
        case "playlists": return "Playlists (séparées par des virgules)";
        case "followed_artists": return "Artistes suivis (IDs, séparés par des virgules)";
        case "liked_tracks": return "Morceaux aimés (IDs, séparés par des virgules)";
        default: return name;
      }
    })();

    const type = (() => {
      if (name === "email") return "email";
      if (name === "password") return "password";
      if (name === "profile.avatar_url") return "url";
      return "text";
    })();

    const isTextarea = name === "biography";
    const placeholder = "";

    const onChange = (e) => setFormPath(name, e.target.value);

    return (
      <div className={`info-item ${isTextarea ? "full-width" : ""}`} key={name}>
        <label>{label}</label>
        {isTextarea ? (
          <textarea
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            rows={5}
            style={{ width: "100%" }}
          />
        ) : (
          <input
            type={type}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  return (
    <div className="account-container">
      <div className="account-card">
        <div className="account-header">
          <h1>{isArtist ? "Modifier le profil artiste" : "Modifier mon profil"}</h1>
          <p>Mettez à jour vos informations</p>
        </div>

        <form onSubmit={handleSubmit} className="account-info">
          <div className="info-grid">
            {fieldOrder.map((k) => renderInput(k, form[k]))}
          </div>

          {success && <div className="success-message" style={{ marginTop: 12 }}>{success}</div>}
          {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}

          <div className="account-actions" style={{ marginTop: 16 }}>
            <button type="submit" className="btn-edit" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" className="btn-logout" onClick={() => navigate("/account")}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}