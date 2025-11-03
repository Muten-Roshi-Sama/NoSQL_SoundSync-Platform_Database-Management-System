import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

export default function Player({ currentTrack, onNext, onPrev }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioSrc = currentTrack
    ? currentTrack.audio_url.startsWith("http")
      ? currentTrack.audio_url
      : `${API_BASE}${currentTrack.audio_url}`
    : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, currentTrack]);

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
      <div className="flex items-center gap-3 w-1/3">
        <div className="h-12 w-12 bg-neutral-800 rounded-md flex items-center justify-center">
          🎵
        </div>
        <div>
          <p className="font-semibold truncate">{currentTrack.title}</p>
          <p className="text-sm text-gray-400 truncate">
            {currentTrack.artist || currentTrack.artist_id}
          </p>
        </div>
      </div>

      {/* Contrôles de lecture */}
      <div className="player-controls flex items-center gap-5 justify-center w-1/3">
        <button onClick={onPrev}>
          <SkipBack size={24} />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="player-play-btn"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={onNext}>
          <SkipForward size={24} />
        </button>
      </div>

      {/* Durée */}
      <div className="w-1/3 text-right text-sm text-gray-400">
        {currentTrack.duration
          ? `${Math.floor(currentTrack.duration / 60)}:${(
              "0" + (currentTrack.duration % 60)
            ).slice(-2)}`
          : ""}
      </div>

      <audio ref={audioRef} src={audioSrc} autoPlay />
    </div>
  );
}
