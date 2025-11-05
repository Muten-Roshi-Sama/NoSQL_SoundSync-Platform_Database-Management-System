import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import Player from "../../components/Player";
import "../../static/css/Songs.css";

export default function Songs() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <div className="songs-page">
      <h1 className="songs-title">Découvre de nouveaux sons 🔥</h1>
      <SearchBar onResults={setTracks} />

      <div className="tracks-grid">
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
              {track.artist || track.artist_id}
            </p>
          </div>
        ))}
      </div>

      <Player currentTrack={currentTrack} onNext={handleNext} onPrev={handlePrev} />
    </div>
  );
}
