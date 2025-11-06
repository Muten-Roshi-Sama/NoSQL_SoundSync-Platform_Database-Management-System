// frontend/src/pages/artists/addAlbum.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createDocument, uploadFile } from "../../services/api";
import "../../static/css/accountOverview.css"; // reuse styling


// ========== Route Constants ==========
const ROUTES = {
    HOME: "/",
    ALBUMS_MANAGE: "/artists/albums/manage",
};



// Logic :
    // /artist/albums/add — Create album + inline track creation (we'll build this first)
    // /artist/albums/manage — List artist's albums, edit/delete albums + their tracks
    // /artist/concerts/manage — CRUD concerts (simpler, references existing tracks)


export default function AddAlbums() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [album, setAlbum] = useState({
        title: "",
        release_year: new Date().getFullYear(),
        description: "",
    });

    const [tracks, setTracks] = useState([
        { title: "", duration: 180, audio_url: "", audio_file: null, cover_url: "" },
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Guard: only artists allowed
    if (!user || (user.role !== "artist" && user.collection !== "artists")) {
        return (
        <div className="account-container">
            <div className="account-card">
            <div className="error-message">Accès réservé aux artistes</div>
            <button className="btn-edit" onClick={() => navigate(ROUTES.HOME)}>
                Retour
            </button>
            </div>
        </div>
        );
    }

    const updateAlbumField = (field, value) => {
        setAlbum((prev) => ({ ...prev, [field]: value }));
    };

    const updateTrackField = (index, field, value) => {
        setTracks((prev) =>
        prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
        );
    };

    const addTrack = () => {
        setTracks((prev) => [
        ...prev,
        { title: "", duration: 180, audio_url: "", cover_url: "" },
        ]);
    };

    const removeTrack = (index) => {
        if (tracks.length === 1) {
        setError("Un album doit contenir au moins une piste");
        return;
        }
        setTracks((prev) => prev.filter((_, i) => i !== index));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!album.title.trim()) {
        setError("Le titre de l'album est requis");
        return;
        }
        if (tracks.some((t) => !t.title.trim())) {
        setError("Toutes les pistes doivent avoir un titre");
        return;
        }

        try {
        setSubmitting(true);

        // 1. Create album (without tracklist yet)
        const albumPayload = {
            title: album.title.trim(),
            artist_id: user._id,
            release_year: parseInt(album.release_year, 10),
            description: album.description.trim(),
            tracklist: [], // will update after creating tracks
        };

        const albumRes = await createDocument("albums", albumPayload);
        const albumId = albumRes.id; // backend returns { id, message }

        // 2. Create all tracks with album_id reference
        const trackIds = [];
        for (const track of tracks) {
            let audioUrl = (track.audio_url || "").trim();

            // If user selected a file, upload it first
            if (track.audio_file) {
                try {
                    const uploadRes = await uploadFile(track.audio_file);
                    // uploadRes.url is like "/static/audio/abc123.mp3"
                    // Build full URL (API_BASE is already imported from api.js)
                    audioUrl = `http://127.0.0.1:8000${uploadRes.url}`;
                } catch (uploadErr) {
                    console.error("Upload failed for track", track.title, uploadErr);
                    // If upload fails, we still create track but audio_url will be empty or fallback
                    setError(`Upload failed for "${track.title}": ${uploadErr.message}. Track created without audio.`);
                }
            }

            const trackPayload = {
                title: track.title.trim(),
                artist_id: user._id,
                album_id: albumId,
                duration: parseInt(track.duration, 10) || 180,
                audio_url: audioUrl,  // ← now uses uploaded file URL or fallback
                cover_url: track.cover_url.trim() || "",
            };
            const trackRes = await createDocument("tracks", trackPayload);
            trackIds.push(trackRes.id);
        }

        // 3. Update album with tracklist (array of track IDs)
        // We need an updateDocument call here
        // For now, if your backend doesn't auto-link, we'll skip or add a TODO
        // Ideally: await updateDocument("albums", albumId, { tracklist: trackIds });

        setSuccess(`Album "${album.title}" créé avec ${tracks.length} piste(s) !`);

        // Reset form
        setTimeout(() => {
            navigate(ROUTES.ALBUMS_MANAGE); // navigate to manage page (we'll create next)
        }, 1000);
        } catch (err) {
        console.error(err);
        setError(err.message || "Erreur lors de la création de l'album");
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <div className="account-container">
        <div className="account-card">
            {/* Header */}
            <div className="account-header">
            <h1>Ajouter un Album</h1>
            <p>Créez un nouvel album avec ses pistes</p>
            </div>

            <form onSubmit={handleSubmit} className="account-info">
            {/* Album Fields */}
            <div className="info-grid">
                <div className="info-item">
                <label>Titre de l'album *</label>
                    <input
                    type="text"
                    className="form-input"
                    value={album.title}
                    onChange={(e) => updateAlbumField("title", e.target.value)}
                    placeholder="ex: Speedcore Symphony"
                    required
                    />
                </div>

                <div className="info-item">
                <label>Année de sortie</label>
                <input
                    type="number"
                    value={album.release_year}
                    onChange={(e) => updateAlbumField("release_year", e.target.value)}
                    min="1900"
                    max="2100"
                />
                </div>

                <div className="info-item full-width">
                <label>Description</label>
                    <textarea
                    className="form-input"
                    value={album.description}
                    onChange={(e) => updateAlbumField("description", e.target.value)}
                    placeholder="Décrivez votre album..."
                    rows={3}
                    style={{ width: "100%" }}
                    />
                </div>
            </div>

            {/* Tracks Section */}
            <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Pistes de l'album</h3>
                <button
                    type="button"
                    onClick={addTrack}
                    className="btn-edit"
                    style={{ fontSize: 14, padding: "6px 12px" }}
                >
                    + Ajouter une piste
                </button>
                </div>

                {tracks.map((track, idx) => (
                <div
                    key={idx}
                    style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                    position: "relative",
                    }}
                >
                    <button
                    type="button"
                    onClick={() => removeTrack(idx)}
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: 12,
                    }}
                    >
                    − Supprimer
                    </button>

                    <h4 style={{ marginTop: 0, marginBottom: 12 }}>Piste {idx + 1}</h4>

                    <div className="info-grid">
                    <div className="info-item">
                        <label>Titre *</label>
                        <input
                        type="text"
                        value={track.title}
                        onChange={(e) => updateTrackField(idx, "title", e.target.value)}
                        placeholder="ex: Hyperflux"
                        required
                        />
                    </div>

                    <div className="info-item">
                        <label>Durée (secondes)</label>
                        <input
                        type="number"
                        value={track.duration}
                        onChange={(e) => updateTrackField(idx, "duration", e.target.value)}
                        min="1"
                        placeholder="180"
                        />
                    </div>

                    <div className="info-item full-width">
                        <label>Fichier Audio (MP3)</label>
                        <input
                            type="file"
                            accept=".mp3,audio/*"
                            onChange={(e) => updateTrackField(idx, "audio_file", e.target.files?.[0] || null)}
                        />
                        <small style={{ display: "block", marginTop: 6, color: "#666" }}>
                            Vous pouvez aussi laisser "URL Audio" vide et uploader un MP3.
                        </small>
                    </div>

                    <div className="info-item full-width">
                        <label>URL Couverture (optionnel)</label>
                        <input
                        type="url"
                        value={track.cover_url}
                        onChange={(e) => updateTrackField(idx, "cover_url", e.target.value)}
                        placeholder="https://example.com/cover.jpg"
                        />
                    </div>
                    </div>
                </div>
                ))}
            </div>

            {/* Feedback */}
            {error && <div className="error-message" style={{ marginTop: 16 }}>{error}</div>}
            {success && <div className="success-message" style={{ marginTop: 16 }}>{success}</div>}

            {/* Actions */}
            <div className="account-actions" style={{ marginTop: 24 }}>
                <button type="submit" className="btn-edit" disabled={submitting}>
                {submitting ? "Création en cours..." : "Créer l'album"}
                </button>
                <button
                type="button"
                className="btn-logout"
                onClick={() => navigate(ROUTES.ALBUMS_MANAGE)}
                >
                Annuler
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}