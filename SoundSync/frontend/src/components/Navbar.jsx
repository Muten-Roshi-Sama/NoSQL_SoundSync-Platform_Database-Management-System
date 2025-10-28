import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-neutral-900 text-white">
      <Link to="/" className="text-xl font-bold">Soundsync</Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span>👤 {user.username}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}
