const API_BASE = "http://127.0.0.1:8000/crud";

export async function loginUser(identifier, password) {
  // 1️⃣ Essayer via username
  let res = await fetch(`${API_BASE}/users/by/username/${identifier}`);
  let data = await res.json();

  // Si 404, on tente via email
  if (res.status === 404) {
    res = await fetch(`${API_BASE}/users/by/email/${identifier}`);
    data = await res.json();
  }

  // 2️⃣ Vérifier qu'on a bien un document
  const user = data.document;
  if (!user) throw new Error("Utilisateur introuvable");

  // 3️⃣ Vérifier le mot de passe
  if (user.password !== password) throw new Error("Mot de passe incorrect");

  return user;
}


export async function registerUser(formData) {
  const res = await fetch(`${API_BASE}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) throw new Error("Erreur lors de la création du compte");
  return await res.json();
}

export async function searchTracks(query) {
  if (!query) return [];
  const res = await fetch(`${API_BASE}/tracks/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.items || [];
}

