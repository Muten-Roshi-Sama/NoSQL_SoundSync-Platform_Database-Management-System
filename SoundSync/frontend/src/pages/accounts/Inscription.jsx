import { useState } from "react";
import { registerUser } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import "../../static/css/Inscription.css";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-card">
        
        {/* En-tête */}
        <div className="inscription-header">
          <h1>Créer un compte</h1>
          <p>Rejoins la communauté SoundSync 🎵</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="inscription-form">
          
          {/* Type de compte */}
          <div className="form-group">
            <label htmlFor="role">Type de compte</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">👤 Utilisateur (écouter de la musique)</option>
              <option value="artist">🎵 Artiste (publier de la musique)</option>
            </select>
          </div>

          {/* Nom d'utilisateur */}
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              type="text"
              placeholder="Entrez votre nom d'utilisateur"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 6 caractères"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Bouton */}
          <button type="submit" className="inscription-submit">
            S'inscrire
          </button>
        </form>

        {/* Footer */}
        <div className="inscription-footer">
          <p>
            Déjà un compte ?{" "}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
