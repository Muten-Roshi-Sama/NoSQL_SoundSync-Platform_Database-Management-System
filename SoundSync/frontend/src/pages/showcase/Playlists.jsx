import { useState, useEffect } from "react";
import Player from "../../components/Player";
import { useAuth } from "../../context/AuthContext";
import { getAll, createDocument } from "../../services/api";
import "../../static/css/Songs.css";

export default function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Charger les playlists de l'utilisateur
  useEffect(() => {
    if (!user) return;

    const fetchPlaylists = async () => {
      try {
        const res = await getAll("playlists", {
          filter: { user_id: user._id },
          limit: 50,
        });
        setPlaylists(res.items || []);
      } catch (err) {
        console.error("Erreur chargement playlists :", err);
      }
    };

    fetchPlaylists();
  }, [user]);

  // Charger les tracks d'une playlist sélectionnée
  useEffect(() => {
    if (!selectedPlaylist || !selectedPlaylist.track_ids) {
      setTracks([]);
      return;
    }

    const fetchTracks = async () => {
      try {
        const promises = selectedPlaylist.track_ids.map((trackId) =>
          getAll("tracks", { filter: { _id: trackId }, limit: 1 })
        );
        const results = await Promise.all(promises);
        const loadedTracks = results
          .map((res) => res.items?.[0])
          .filter(Boolean);
        setTracks(loadedTracks);
      } catch (err) {
        console.error("Erreur chargement tracks playlist :", err);
      }
    };

    fetchTracks();
  }, [selectedPlaylist]);

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentTrack(null);
    setCurrentIndex(0);
  };

  const handleTrackClick = (track, index) => {
    setCurrentTrack(track);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName || !user) return;
    try {
      const res = await createDocument("playlists", {
        name: newPlaylistName,
        user_id: user._id,
        track_ids: [],
        created_at: new Date().toISOString(),
      });
      setPlaylists((prev) => [
        ...prev,
        { _id: res.id, name: newPlaylistName, user_id: user._id, track_ids: [] },
      ]);
      setNewPlaylistName("");
    } catch (err) {
      console.error("Erreur création playlist :", err);
    }
  };

  return (
    <div className="songs-page">
      <h1 className="songs-title">Tes playlists 🎶</h1>

      {/* Création nouvelle playlist */}
      <div className="create-playlist flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nom de la playlist"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          className="p-2 rounded bg-neutral-800 text-white flex-1"
        />
        <button
          onClick={handleCreatePlaylist}
          className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded"
        >
          Créer
        </button>
      </div>

      {/* Liste des playlists */}
      <div className="playlists-grid mb-6">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            className={`playlist-card cursor-pointer p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 ${
              selectedPlaylist?._id === playlist._id ? "border-2 border-green-500" : ""
            }`}
            onClick={() => handlePlaylistClick(playlist)}
          >
            <p className="font-semibold truncate">{playlist.name}</p>
            <p className="text-sm text-gray-400 truncate">
              {playlist.track_ids?.length || 0} track(s)
            </p>
          </div>
        ))}
      </div>

      {/* Tracks de la playlist sélectionnée */}
      {selectedPlaylist && (
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Playlist : {selectedPlaylist.name}
          </h2>
          <div className="tracks-grid mb-6">
            {tracks.map((track, index) => (
              <div
                key={track._id}
                onClick={() => handleTrackClick(track, index)}
                className={`track-card ${
                  currentTrack?._id === track._id ? "active" : ""
                } cursor-pointer`}
              >
                <div className="h-36 bg-neutral-800 rounded-lg mb-3 flex items-center justify-center">
                  🎵
                </div>
                <p className="font-semibold truncate">{track.title}</p>
                <p className="text-sm text-gray-400 truncate">
                  {track.artist_id}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Player currentTrack={currentTrack} onNext={handleNext} onPrev={handlePrev} user={user} />
    </div>
  );
}
