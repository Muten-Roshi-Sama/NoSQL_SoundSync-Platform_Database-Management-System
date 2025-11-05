import { useState, useEffect } from "react";
import { getAll } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../static/css/accountOverview.css";

export default function AccountOverview() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Infer collection even if "role" is not provided
  const resolveCollectionFromUser = (u) => {
    if (!u) return "users";
    if (u.collection === "artists") return "artists";
    if (u.collection === "users") return "users";
    // fallback from normalized role only
    return u.role === "artist" ? "artists" : "users";
  };

  // Fetch full account data on mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Always-200 finder: try a few fields in order and return first match
    const findAccountDoc = async (collection, u) => {
      const fields = collection === "artists"
        ? ["username", "_id", "email"]
        : ["username", "email", "_id"];
      for (const f of fields) {
        const v = f === "_id" ? u._id : u[f];
        if (!v) continue;
        const res = await getAll(collection, { filter: { [f]: v }, limit: 1 });
        const item = res?.items?.[0];
        if (item) return item;
      }
      return null;
    };


    const fetchAccountData = async () => {
      try {
        setLoading(true);

        const collection = resolveCollectionFromUser(user);
        const doc = await findAccountDoc(collection, user);
        if (doc) {
          setAccountData(doc);
        } else {
          setError("Impossible de charger les informations du compte");
        }
      } catch (err) {
        console.error("Error fetching account:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="account-card">
          <p className="loading-text">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-container">
        <div className="account-card">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (!accountData) return null;

  // Rely only on AuthContext/collection
  const isArtist = resolveCollectionFromUser(user) === "artists";

  // User shape helpers
  const displayName =
    accountData.profile?.display_name ||
    accountData.username;
  const avatarUrl = accountData.profile?.avatar_url;

  return (
    <div className="account-container">
      <div className="account-card">
        {/* Header */}
        <div className="account-header">
          <h1>Mon Compte</h1>
          <p>Gérez vos informations personnelles</p>
        </div>

        {/* Account Info */}
        <div className="account-info">
          {/* Profile Picture / Avatar */}
          <div className="avatar-section">
            <div className="avatar-circle">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName || "avatar"}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : isArtist ? (
                "🎵"
              ) : (
                "👤"
              )}
            </div>
            <p className="role-badge">{isArtist ? "Artiste" : "Utilisateur"}</p>
          </div>

          {/* Details */}
          <div className="info-grid">
            {/* Common */}
            {/* <div className="info-item">
              <label>ID</label>
              <p className="id-text">{accountData._id}</p>
            </div> */}

            {/* User-specific fields */}
            {!isArtist && (
              <>
                <div className="info-item">
                  <label>Nom d'affichage</label>
                  <p>{displayName}</p>
                </div>

                <div className="info-item">
                  <label>Nom d'utilisateur</label>
                  <p>{accountData.username}</p>
                </div>

                <div className="info-item">
                  <label>Email</label>
                  <p>{accountData.email}</p>
                </div>

                <div className="info-item">
                  <label>Abonnement</label>
                  <p>{accountData.subscription || "—"}</p>
                </div>

                <div className="info-item">
                  <label>Playlists</label>
                  <p>{accountData.playlists?.length ?? 0}</p>
                </div>

                <div className="info-item">
                  <label>Artistes suivis</label>
                  <p>{accountData.followed_artists?.length ?? 0}</p>
                </div>

                <div className="info-item">
                  <label>Morceaux aimés</label>
                  <p>{accountData.liked_tracks?.length ?? 0}</p>
                </div>
              </>
            )}

            {/* Artist-specific fields */}
            {isArtist && (
              <>
                <div className="info-item">
                  <label>Nom d'artiste</label>
                  <p>{accountData.username}</p>
                </div>

                <div className="info-item">
                  <label>Genre</label>
                  <p>{accountData.genre || "—"}</p>
                </div>

                {accountData.biography && (
                  <div className="info-item full-width">
                    <label>Biographie</label>
                    <p>{accountData.biography}</p>
                  </div>
                )}
              </>
            )}

            {/* Optional: created_at if present */}
            {"created_at" in accountData && accountData.created_at && (
              <div className="info-item">
                <label>Membre depuis</label>
                <p>{new Date(accountData.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="account-actions">
            <button onClick={() => navigate("/account/edit")} className="btn-edit">
              Modifier mon profil
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}