import { useState } from "react";
import { loginUser } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../../static/css/Login.css";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(identifier, password);
      login(user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* En-tête */}
        <div className="login-header">
          <h1>Connexion</h1>
          <p>Bienvenue sur SoundSync 🎵</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="login-form">
          
          {/* Identifiant */}
          <div className="form-group">
            <label htmlFor="identifier">Nom d'utilisateur ou e-mail</label>
            <input
              id="identifier"
              type="text"
              placeholder="Entrez votre identifiant"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Bouton */}
          <button type="submit" className="login-submit">
            Se connecter
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Pas encore de compte ?{" "}
            <Link to="/register">Inscris-toi</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
