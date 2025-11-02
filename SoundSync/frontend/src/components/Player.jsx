const API_BASE = "http://127.0.0.1:8000";

export default function Player({ currentTrack }) {
  if (!currentTrack) return null;

  // si l'URL ne contient pas déjà le host, on le rajoute
  const audioSrc = currentTrack.audio_url.startsWith("http")
    ? currentTrack.audio_url
    : `${API_BASE}${currentTrack.audio_url}`;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-neutral-900 text-white flex justify-between items-center p-4">
      <div>
        🎵 {currentTrack.title} — {currentTrack.artist || currentTrack.artist_id}
      </div>
      <audio key={currentTrack._id} controls src={audioSrc} autoPlay />
    </div>
  );
}
