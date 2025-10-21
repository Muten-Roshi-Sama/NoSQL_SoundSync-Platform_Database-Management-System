import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });

  const API_URL = "http://localhost:8000/api/users";

  // 🔹 Récupérer les utilisateurs avec pagination
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?skip=${skip}&limit=${limit}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
      const data = await res.json();
      console.log("Données reçues du backend :", data);
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la récupération des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [skip, limit]);

  // 🔹 Gérer la création d'un utilisateur
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de l'utilisateur");
      setFormData({ name: "", email: "", role: "" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création de l'utilisateur");
    }
  };

  // 🔹 Supprimer un utilisateur
  const deleteUser = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  // 🔹 Pagination
  const handlePrev = () => setSkip(Math.max(skip - limit, 0));
  const handleNext = () => setSkip(Math.min(skip + limit, total - limit));
  const totalPages = Math.ceil(total / limit);

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">👥 Gestion des utilisateurs</h1>

      {/* 🟢 Formulaire de création */}
      <form onSubmit={handleCreate} className="bg-gray-100 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Nom"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="flex-1 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="flex-1 p-2 border rounded"
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
          className="p-2 border rounded"
        >
          <option value="">Rôle</option>
          <option value="admin">Admin</option>
          <option value="utilisateur">utilisateur</option>
          <option value="artiste">artiste</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ➕ Ajouter
        </button>
      </form>

      {/* 🟡 Tableau des utilisateurs */}
      {users.length === 0 ? (
        <p className="text-center">Aucun utilisateur trouvé.</p>
      ) : (
        <>
          <table className="min-w-full border border-gray-300 rounded-lg mb-4">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Nom</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Rôle</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.role || "—"}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 🔹 Contrôles de pagination */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={skip === 0}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded disabled:opacity-50"
            >
              ← Précédent
            </button>

            <span>
              Page {Math.floor(skip / limit) + 1} / {totalPages || 1}  
              {"  "}({total} utilisateurs)
            </span>

            <button
              onClick={handleNext}
              disabled={skip + limit >= total}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded disabled:opacity-50"
            >
              Suivant →
            </button>

            {/* Sélecteur du nombre d'éléments par page */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setSkip(0);
              }}
              className="border p-2 rounded"
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
