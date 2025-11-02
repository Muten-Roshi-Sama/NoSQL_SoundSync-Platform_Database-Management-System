import { useState, useEffect } from "react";
import { searchTracks } from "../services/api";

export default function SearchBar({ onResults }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchTracks = async () => {
      const results = await searchTracks(query);
      onResults(results);
    };

    const delayDebounce = setTimeout(fetchTracks, 300); // debounce 300ms
    return () => clearTimeout(delayDebounce);
  }, [query, onResults]);

  return (
    <div className="mt-4">
      <input
        type="text"
        placeholder="Rechercher un titre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded bg-neutral-800 text-white"
      />
    </div>
  );
}
