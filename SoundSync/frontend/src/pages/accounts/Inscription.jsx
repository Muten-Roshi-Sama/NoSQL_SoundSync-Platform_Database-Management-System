import { useState } from "react";
import { registerUser } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
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
    <div className="flex flex-col items-center justify-center h-screen text-white bg-neutral-950">
      <h1 className="text-2xl mb-4 font-bold">Créer un compte</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="p-2 rounded bg-neutral-800"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="p-2 rounded bg-neutral-800"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="p-2 rounded bg-neutral-800"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="bg-green-600 hover:bg-green-700 py-2 rounded">
          S'inscrire
        </button>
      </form>
      <p className="mt-3 text-sm">
        Déjà un compte ?{" "}
        <Link to="/login" className="text-blue-400 hover:underline">Connexion</Link>
      </p>
    </div>
  );
}
