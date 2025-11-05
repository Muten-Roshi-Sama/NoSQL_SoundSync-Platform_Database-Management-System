import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../static/css/Navbar.css"; // chemin vers ton fichier CSS

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          🎧 Soundsync
        </Link>

        <div className="navbar-links">
          <Link
            to="/artists"
            className={location.pathname === "/artists" ? "active" : ""}
          >
            Artists
          </Link>
          <Link
            to="/favorites"
            className={location.pathname === "/favorites" ? "active" : ""}
          >
            Favorites
          </Link>
          <Link
            to="/playlists"
            className={location.pathname === "/playlists" ? "active" : ""}
          >
            Playlists
          </Link>
        </div>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/account" className="navbar-user">👤 {user.username}</Link>
            <button onClick={logout} className="navbar-btn logout">
              Déconnexion
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-btn login">
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}
