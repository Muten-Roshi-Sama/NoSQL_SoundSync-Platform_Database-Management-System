import { useState } from "react";
import { loginUser } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center h-screen text-white bg-neutral-950">
      <h1 className="text-2xl mb-4 font-bold">Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
        <input
          type="text"
          placeholder="Nom d'utilisateur ou e-mail"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="p-2 rounded bg-neutral-800"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-neutral-800"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="bg-green-600 hover:bg-green-700 py-2 rounded">Se connecter</button>
      </form>
      <p className="mt-3 text-sm">
        Pas encore de compte ?{" "}
        <Link to="/register" className="text-blue-400 hover:underline">Inscris-toi</Link>
      </p>
    </div>
  );
}
