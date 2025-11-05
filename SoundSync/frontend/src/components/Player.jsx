import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Heart, X, Plus } from "lucide-react";
import { createDocument, deleteDocumentByFilter, getAll, updateDocument } from "../services/api";
import "../static/css/Player.css";

const API_BASE = "http://127.0.0.1:8000";

export default function Player({ currentTrack, onNext, onPrev, user }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);

  const audioSrc = currentTrack
    ? currentTrack.audio_url.startsWith("http")
      ? currentTrack.audio_url
      : `${API_BASE}${currentTrack.audio_url}`
    : null;

  // Lecture automatique quand on change de piste
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);

    // Vérifier si la musique est likée
    if (!user) return;
    const checkLike = async () => {
      try {
        const res = await getAll("likes", {
          filter: { user_id: user._id, target_type: "track", target_id: currentTrack._id },
          limit: 1,
        });
        setIsLiked(res.total > 0);
      } catch (err) {
        console.error(err);
      }
    };
    checkLike();
  }, [currentTrack, user]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const handleLike = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!currentTrack) return;
    try {
      if (isLiked) {
        await deleteDocumentByFilter("likes", {
          user_id: user._id,
          target_type: "track",
          target_id: currentTrack._id,
        });
        setIsLiked(false);
      } else {
        await createDocument("likes", {
          user_id: user._id,
          target_type: "track",
          target_id: currentTrack._id,
          created_at: new Date().toISOString(),
        });
        setIsLiked(true);
      }
    } catch (err) {
      console.error("Erreur like :", err);
    }
  };

  const openPlaylistModal = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await getAll("playlists", { filter: { user_id: user._id }, limit: 50 });
      setPlaylists(res.items || []);
      // Pré-remplir les playlists contenant déjà la track
      const selected = res.items
        ?.filter(p => p.track_ids?.includes(currentTrack._id))
        .map(p => p._id) || [];
      setSelectedPlaylists(selected);
      setShowPlaylistModal(true);
    } catch (err) {
      console.error("Erreur récupération playlists :", err);
    }
  };

  const togglePlaylistSelection = (playlistId) => {
    setSelectedPlaylists(prev => {
      if (prev.includes(playlistId)) return prev.filter(id => id !== playlistId);
      return [...prev, playlistId];
    });
  };

  const savePlaylists = async () => {
    try {
      for (let playlist of playlists) {
        const shouldInclude = selectedPlaylists.includes(playlist._id);
        const currentlyIncludes = playlist.track_ids?.includes(currentTrack._id);

        if (shouldInclude && !currentlyIncludes) {
          await updateDocument("playlists", playlist._id, {
            track_ids: [...(playlist.track_ids || []), currentTrack._id],
          });
        } else if (!shouldInclude && currentlyIncludes) {
          await updateDocument("playlists", playlist._id, {
            track_ids: (playlist.track_ids || []).filter(id => id !== currentTrack._id),
          });
        }
      }
      setShowPlaylistModal(false);
    } catch (err) {
      console.error("Erreur mise à jour playlists :", err);
    }
  };

  if (!currentTrack) {
    return (
      <div className="player-container text-gray-400 text-center">
        Aucun son en cours
      </div>
    );
  }

  return (
    <div className="player-container">
      {/* Titre et artiste */}
      <div className="track-info">
        <div className="cover-art">🎵</div>
        <div>
          <p className="track-title">{currentTrack.title}</p>
          <p className="track-artist">{currentTrack.artist || currentTrack.artist_id}</p>
        </div>
      </div>

      {/* Contrôles */}
      <div className="player-controls">
        <button onClick={onPrev}><SkipBack size={24} /></button>
        <button onClick={togglePlay} className="player-play-btn">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={onNext}><SkipForward size={24} /></button>
      </div>

      {/* Like + durée + playlist */}
      <div className="player-right">
        <button onClick={handleLike} className="like-btn">
          <Heart size={22} fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "white"} />
        </button>
        <button onClick={openPlaylistModal} className="like-btn">
          <Plus size={20} stroke="white" />
        </button>
        <span className="track-duration">
          {currentTrack.duration
            ? `${Math.floor(currentTrack.duration / 60)}:${("0" + (currentTrack.duration % 60)).slice(-2)}`
            : ""}
        </span>
      </div>

      <audio ref={audioRef} src={audioSrc} autoPlay />

      {/* Modal pour connexion */}
      {showLoginModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <X size={18} />
            </button>
            <p>Vous devez vous connecter pour liker cette musique.</p>
          </div>
        </div>
      )}

      {/* Modal pour ajouter aux playlists */}
      {showPlaylistModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowPlaylistModal(false)}>
              <X size={18} />
            </button>
            <h3>Ajouter à des playlists</h3>
            <div className="playlist-selection flex flex-col gap-2 mt-2">
              {playlists.map(p => (
                <label key={p._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPlaylists.includes(p._id)}
                    onChange={() => togglePlaylistSelection(p._id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
            <button
              onClick={savePlaylists}
              className="bg-green-600 hover:bg-green-700 py-2 px-4 mt-3 rounded"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
