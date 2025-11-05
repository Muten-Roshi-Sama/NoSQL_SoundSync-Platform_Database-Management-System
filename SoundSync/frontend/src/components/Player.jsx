import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Heart } from "lucide-react";
import { createDocument, deleteDocumentByFilter, getAll } from "../services/api";
import "../static/css/Player.css";

const API_BASE = "http://127.0.0.1:8000";

export default function Player({ currentTrack, onNext, onPrev, user }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  console.log("[Player] Props received:", { currentTrack, user });

  const audioSrc = currentTrack
    ? currentTrack.audio_url.startsWith("http")
      ? currentTrack.audio_url
      : `${API_BASE}${currentTrack.audio_url}`
    : null;

  // Lecture automatique et check like
  useEffect(() => {
    console.log("[Player useEffect] currentTrack change:", currentTrack);

    if (!audioRef.current || !currentTrack) {
      console.log("[Player] audioRef or currentTrack undefined");
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(err => {
      console.error("[Player] play() error:", err);
    });
    setIsPlaying(true);

    // Vérifier si la musique est likée
    if (!user) {
      console.log("[Player] user undefined, skipping like check");
      return;
    }

    const checkLike = async () => {
      try {
        console.log("[Player] Checking if track is liked:", currentTrack._id);
        const res = await getAll("likes", {
          filter: {
            user_id: user._id,
            target_type: "track",
            target_id: currentTrack._id,
          },
          limit: 1,
        });
        console.log("[Player] Like check result:", res);
        setIsLiked(res.total > 0);
      } catch (err) {
        console.error("[Player] Error checking like:", err);
      }
    };

    checkLike();
  }, [currentTrack, user]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(err => console.error("[Player] play() error:", err));
    setIsPlaying(!isPlaying);
    console.log("[Player] togglePlay, isPlaying:", !isPlaying);
  };

  const handleLike = async () => {
    console.log("[Player] handleLike clicked", { currentTrack, user, isLiked });

    if (!user) {
      console.warn("[Player] Cannot like, user undefined");
      return;
    }
    if (!currentTrack) {
      console.warn("[Player] Cannot like, currentTrack undefined");
      return;
    }

    try {
      if (isLiked) {
        console.log("[Player] Unliking track:", currentTrack._id);
        await deleteDocumentByFilter("likes", {
          user_id: user._id,
          target_type: "track",
          target_id: currentTrack._id,
        });
        setIsLiked(false);
      } else {
        console.log("[Player] Liking track:", currentTrack._id);
        await createDocument("likes", {
          user_id: user._id,
          target_type: "track",
          target_id: currentTrack._id,
          created_at: new Date().toISOString(),
        });
        setIsLiked(true);
      }
    } catch (err) {
      console.error("[Player] Error like/unlike:", err);
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
      <div className="track-info">
        <div className="cover-art">🎵</div>
        <div>
          <p className="track-title">{currentTrack.title}</p>
          <p className="track-artist">{currentTrack.artist || currentTrack.artist_id}</p>
        </div>
      </div>

      <div className="player-controls">
        <button onClick={onPrev}>
          <SkipBack size={24} />
        </button>
        <button onClick={togglePlay} className="player-play-btn">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={onNext}>
          <SkipForward size={24} />
        </button>
      </div>

      <div className="player-right">
        <button onClick={handleLike} className="like-btn">
          <Heart size={22} fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "white"} />
        </button>
        <span className="track-duration">
          {currentTrack.duration
            ? `${Math.floor(currentTrack.duration / 60)}:${("0" + (currentTrack.duration % 60)).slice(-2)}`
            : ""}
        </span>
      </div>

      <audio ref={audioRef} src={audioSrc} autoPlay />
    </div>
  );
}
