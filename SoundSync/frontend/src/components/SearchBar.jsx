import { useState } from "react";
import { searchTracks } from "../services/api";

export default function SearchBar({ onResults }) {
  const [query, setQuery] = useState("");
  

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const results = await searchTracks(query);
    onResults(results);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mt-4">
      <input
        type="text"
        placeholder="Rechercher un titre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 p-2 rounded bg-neutral-800 text-white"
      />
      <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
        Rechercher
      </button>
    </form>
  );
}
