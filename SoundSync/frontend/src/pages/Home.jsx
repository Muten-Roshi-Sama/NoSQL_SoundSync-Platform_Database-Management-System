import { Link } from "react-router-dom";
import "../static/css/Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <h1 className="hero-title">Bienvenue sur <span>Soundsync</span> 🎧</h1>
        <p className="hero-subtitle">
          Découvre, écoute et partage tes sons préférés dans un univers immersif.
        </p>

        <div className="hero-buttons">
          <Link to="/songs" className="btn btn-primary">
            🔍 Explorer la musique
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Se connecter
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>🎶 Artistes</h3>
          <p>Découvre des talents du monde entier et suis tes artistes préférés.</p>
        </div>

        <div className="feature-card">
          <h3>❤️ Favoris</h3>
          <p>Crée ta bibliothèque personnalisée avec tes morceaux préférés.</p>
        </div>

        <div className="feature-card">
          <h3>🎧 Playlists</h3>
          <p>Assemble les morceaux que tu aimes dans des playlists uniques.</p>
        </div>
      </section>
    </div>
  );
}
