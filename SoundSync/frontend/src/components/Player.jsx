export default function Player({ currentTrack }) {
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-neutral-900 text-white flex justify-between items-center p-4">
      <div>
        🎵 {currentTrack.title} — {currentTrack.artist}
      </div>
      <audio controls src={currentTrack.audio_url} autoPlay />
    </div>
  );
}
