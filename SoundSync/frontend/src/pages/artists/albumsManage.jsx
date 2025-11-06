// frontend/src/pages/artists/albumsManage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAll, updateDocument, createDocument, deleteDocument } from "../../services/api";
import "../../static/css/accountOverview.css";

const verbose = true;
// ========== Route Constants ==========
const ROUTES = {
    HOME: "/",
    ALBUMS_MANAGE: "/artists/albums/manage",
    ALBUMS_ADD : "/artists/albums/add",
};

export default function AlbumsManage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [albums, setAlbums] = useState([]);
    const [tracks, setTracks] = useState({}); // { albumId: [tracks] }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingAlbum, setEditingAlbum] = useState(null); // album being edited
    const [editForm, setEditForm] = useState({});
    const [editingTracks, setEditingTracks] = useState([]); // tracks for editing album

        // Fetch artist's albums and their tracks
    useEffect(() => {
        // Guard inside useEffect to avoid conditional hook call
        if (!user || (user.role !== "artist" && user.collection !== "artists")) {
        return;
        }

        const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            // 1. Fetch all albums for this artist
            const albumsRes = await getAll("albums", {
            filter: { artist_id: user._id },
            sort: { release_year: -1 },
            });

            const albumsList = albumsRes.items || [];
            setAlbums(albumsList);

            // 2. Fetch all tracks for this artist
            const tracksRes = await getAll("tracks", {
            filter: { artist_id: user._id },
            });

            const tracksList = tracksRes.items || [];

            // Group tracks by album_id
            const tracksByAlbum = {};
            for (const track of tracksList) {
            const albumId = track.album_id;
            if (!tracksByAlbum[albumId]) tracksByAlbum[albumId] = [];
            tracksByAlbum[albumId].push(track);
            }

            setTracks(tracksByAlbum);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement des albums");
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, [user]);

    // Guard: only artists allowed (MOVED AFTER HOOKS)
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


    // Delete album and all its tracks
    const handleDeleteAlbum = async (albumId) => {
        if (!confirm("Supprimer cet album et toutes ses pistes ?")) return;

        try {
        // Delete all tracks first
        const albumTracks = tracks[albumId] || [];
        for (const track of albumTracks) {
            await deleteDocument("tracks", track._id);
        }

        // Delete album
        await deleteDocument("albums", albumId);

        // Update UI
        setAlbums((prev) => prev.filter((a) => a._id !== albumId));
        setTracks((prev) => {
            const newTracks = { ...prev };
            delete newTracks[albumId];
            return newTracks;
        });
        } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression");
        }
    };

    // Start editing an album
    const handleEditAlbum = (album) => {
        console.log("Editing album:", album._id);
        console.log("Tracks for this album:", tracks[album._id]);
        setEditingAlbum(album._id);
        setEditForm({
        title: album.title,
        release_year: album.release_year,
        description: album.description || "",
        });
        setEditingTracks(tracks[album._id] || []);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingAlbum(null);
        setEditForm({});
        setEditingTracks([]);
    };

    // Update album field
    const updateAlbumField = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    // Update track field
    const updateTrackField = (index, field, value) => {
        setEditingTracks((prev) =>
        prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
        );
    };

    // Add new track to editing album
    const addTrackToEdit = () => {
        setEditingTracks((prev) => [
        ...prev,
        {
            _id: null, // null means new track
            title: "",
            duration: 180,
            audio_url: "",
            cover_url: "",
            album_id: editingAlbum,
            artist_id: user._id,
        },
        ]);
    };

    // Remove track from editing (mark for deletion if existing)
    const removeTrackFromEdit = (index) => {
        setEditingTracks((prev) => prev.filter((_, i) => i !== index));
    };

    // Save album changes
    const handleSaveAlbum = async () => {
        try {
        // 1. Update album
        await updateDocument("albums", editingAlbum, editForm);

        // 2. Update/create/delete tracks
        const currentTrackIds = (tracks[editingAlbum] || []).map((t) => t._id);
        const editedTrackIds = editingTracks.filter((t) => t._id).map((t) => t._id);

        // Delete removed tracks
        for (const trackId of currentTrackIds) {
            if (!editedTrackIds.includes(trackId)) {
            await deleteDocument("tracks", trackId);
            }
        }

        // Update or create tracks
        for (const track of editingTracks) {
            if (verbose) {
                console.log("Processing track:", {
                    _id: track._id,
                    title: track.title,
                    album_id: track.album_id,
                    artist_id: track.artist_id
                });
            }
            
            if (track._id) {
                if (verbose) {
                    console.log("Updating track with _id:", track._id, "Type:", typeof track._id);
                }
                // Update existing track
                await updateDocument("tracks", track._id, {
                    title: track.title,
                    duration: parseInt(track.duration, 10),
                    audio_url: track.audio_url,
                    cover_url: track.cover_url,
                });
            } else {
                // Create new track
                await createDocument("tracks", {
                    title: track.title,
                    duration: parseInt(track.duration, 10) || 180,
                    audio_url: track.audio_url || "",
                    cover_url: track.cover_url || "",
                    album_id: editingAlbum,
                    artist_id: user._id,
                });
            }
        }

        // Refresh data
        setEditingAlbum(null);
        setEditForm({});
        setEditingTracks([]);

        // Refetch albums and tracks
        const albumsRes = await getAll("albums", {
            filter: { artist_id: user._id },
            sort: { release_year: -1 },
        });
        setAlbums(albumsRes.items || []);

        const tracksRes = await getAll("tracks", {
            filter: { artist_id: user._id },
        });
        const tracksList = tracksRes.items || [];
        const tracksByAlbum = {};
        for (const track of tracksList) {
            const albumId = track.album_id;
            if (!tracksByAlbum[albumId]) tracksByAlbum[albumId] = [];
            tracksByAlbum[albumId].push(track);
        }
        setTracks(tracksByAlbum);
        } catch (err) {
        console.error(err);
        alert("Erreur lors de la sauvegarde");
        }
    };

    if (loading) {
        return (
        <div className="account-container">
            <div className="account-card">
            <p className="loading-text">Chargement des albums...</p>
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

    return (
        <div className="account-container">
        <div className="account-card">
            {/* Header */}
            <div className="account-header">
            <h1>Gérer mes Albums</h1>
            <p>Modifiez ou supprimez vos albums et pistes</p>
            </div>

            {/* Add Album Button */}
            <div style={{ marginBottom: 24 }}>
            <button
                className="btn-edit"
                onClick={() => navigate(ROUTES.ALBUMS_ADD)}
            >
                + Ajouter un nouvel album
            </button>
            </div>

            {/* Albums List */}
            {albums.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
                Vous n'avez pas encore d'albums.
            </p>
            ) : (
            albums.map((album) => (
                <div
                key={album._id}
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 16,
                }}
                >
                {editingAlbum === album._id ? (
                    /* EDIT MODE */
                    <div>
                    <h3 style={{ marginTop: 0 }}>Modifier l'album</h3>

                    {/* Album Fields */}
                    <div className="info-grid">
                        <div className="info-item">
                        <label>Titre *</label>
                        <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => updateAlbumField("title", e.target.value)}
                        />
                        </div>

                        <div className="info-item">
                        <label>Année</label>
                        <input
                            type="number"
                            value={editForm.release_year}
                            onChange={(e) => updateAlbumField("release_year", e.target.value)}
                        />
                        </div>

                        <div className="info-item full-width">
                        <label>Description</label>
                        <textarea
                            value={editForm.description}
                            onChange={(e) => updateAlbumField("description", e.target.value)}
                            rows={3}
                        />
                        </div>
                    </div>

                    {/* Tracks */}
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <h4 style={{ margin: 0 }}>Pistes</h4>
                        <button
                            type="button"
                            className="btn-edit"
                            onClick={addTrackToEdit}
                            style={{ fontSize: 12, padding: "4px 8px" }}
                        >
                            + Ajouter piste
                        </button>
                        </div>

                        {editingTracks.map((track, idx) => (
                        <div
                            key={idx}
                            style={{
                            border: "1px solid #eee",
                            borderRadius: 4,
                            padding: 12,
                            marginBottom: 8,
                            position: "relative",
                            }}
                        >
                            <button
                            type="button"
                            onClick={() => removeTrackFromEdit(idx)}
                            style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: "#ff4444",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                padding: "2px 6px",
                                cursor: "pointer",
                                fontSize: 10,
                            }}
                            >
                            ×
                            </button>

                            <div className="info-grid">
                            <div className="info-item">
                                <label>Titre</label>
                                <input
                                type="text"
                                value={track.title}
                                onChange={(e) => updateTrackField(idx, "title", e.target.value)}
                                />
                            </div>

                            <div className="info-item">
                                <label>Durée (s)</label>
                                <input
                                type="number"
                                value={track.duration}
                                onChange={(e) => updateTrackField(idx, "duration", e.target.value)}
                                />
                            </div>

                            <div className="info-item full-width">
                                <label>URL Audio</label>
                                <input
                                type="url"
                                value={track.audio_url}
                                onChange={(e) => updateTrackField(idx, "audio_url", e.target.value)}
                                />
                            </div>

                            <div className="info-item full-width">
                                <label>URL Couverture</label>
                                <input
                                type="url"
                                value={track.cover_url}
                                onChange={(e) => updateTrackField(idx, "cover_url", e.target.value)}
                                />
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>

                    {/* Save/Cancel */}
                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                        <button className="btn-edit" onClick={handleSaveAlbum}>
                        Enregistrer
                        </button>
                        <button className="btn-logout" onClick={handleCancelEdit}>
                        Annuler
                        </button>
                    </div>
                    </div>
                ) : (
                    /* VIEW MODE */
                    <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                        <h3 style={{ margin: 0 }}>
                            {album.title} ({album.release_year})
                        </h3>
                        <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: 14 }}>
                            {album.description || "Pas de description"}
                        </p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                        <button
                            className="btn-edit"
                            onClick={() => handleEditAlbum(album)}
                            style={{ fontSize: 12, padding: "6px 12px" }}
                        >
                            ✏️ Modifier
                        </button>
                        <button
                            className="btn-logout"
                            onClick={() => handleDeleteAlbum(album._id)}
                            style={{ fontSize: 12, padding: "6px 12px" }}
                        >
                            🗑️ Supprimer
                        </button>
                        </div>
                    </div>

                    {/* Tracks List */}
                    <div style={{ marginTop: 12 }}>
                        <h4 style={{ margin: "0 0 8px 0", fontSize: 14 }}>
                        Pistes ({(tracks[album._id] || []).length})
                        </h4>
                        {(tracks[album._id] || []).length === 0 ? (
                        <p style={{ fontSize: 12, color: "#999" }}>Aucune piste</p>
                        ) : (
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
                            {(tracks[album._id] || []).map((track) => (
                            <li key={track._id}>
                                {track.title} ({track.duration}s)
                            </li>
                            ))}
                        </ul>
                        )}
                    </div>
                    </div>
                )}
                </div>
            ))
            )}
        </div>
        </div>
    );
}