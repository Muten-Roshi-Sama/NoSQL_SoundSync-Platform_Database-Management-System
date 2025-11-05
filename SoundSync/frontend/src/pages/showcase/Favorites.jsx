import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAll } from "../../services/api";
import Player from "../../components/Player";
import "../../static/css/Favorites.css";

export default function Favorites() {
  const { user } = useAuth();
  const [likedTracks, setLikedTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchLikes = async () => {
      try {
        const res = await getAll("likes", {
          filter: { user_id: user._id, target_type: "track" },
          limit: 100,
        });

        const trackIds = res.items.map((like) => like.target_id);

        const trackPromises = trackIds.map((id) =>
          getAll("tracks", { filter: { _id: id }, limit: 1 }).then((r) => r.items[0])
        );

        const tracks = await Promise.all(trackPromises);

        setLikedTracks(tracks.filter(Boolean));
      } catch (err) {
        console.error("Erreur récupération des likes :", err);
      }
    };

    fetchLikes();
  }, [user]);

  const handleTrackClick = (track, index) => {
    setCurrentTrack(track);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (likedTracks.length === 0) return;
    const nextIndex = (currentIndex + 1) % likedTracks.length;
    setCurrentTrack(likedTracks[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    if (likedTracks.length === 0) return;
    const prevIndex = (currentIndex - 1 + likedTracks.length) % likedTracks.length;
    setCurrentTrack(likedTracks[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">Mes favoris ❤️</h1>

      {likedTracks.length === 0 && (
        <p className="text-gray-400 mt-4">Tu n'as encore liké aucune musique.</p>
      )}

      <div className="tracks-grid">
        {likedTracks.map((track, index) => (
          <div
            key={track._id}
            className={`track-card ${currentTrack?._id === track._id ? "active" : ""} cursor-pointer`}
            onClick={() => handleTrackClick(track, index)}
          >
            <div className="h-36 bg-neutral-800 rounded-lg mb-3 flex items-center justify-center">
              🎵
            </div>
            <p className="font-semibold truncate">{track.title}</p>
            <p className="text-sm text-gray-400 truncate">
              {track.artist || track.artist_id}
            </p>
          </div>
        ))}
      </div>

      {currentTrack && (
        <Player currentTrack={currentTrack} onNext={handleNext} onPrev={handlePrev} user={user} />
      )}
    </div>
  );
}
