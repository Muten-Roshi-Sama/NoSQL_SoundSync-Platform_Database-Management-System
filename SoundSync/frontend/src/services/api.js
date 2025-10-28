const API_BASE = "http://127.0.0.1:8000/api";

export async function loginUser(identifier, password) {
  const res = await fetch(`${API_BASE}/users/by/username/${identifier}`);
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    // Si pas trouvé par username, on essaie l'email
    const resEmail = await fetch(`${API_BASE}/users/by/email/${identifier}`);
    const dataEmail = await resEmail.json();
    if (!dataEmail.items || dataEmail.items.length === 0)
      throw new Error("Utilisateur introuvable");

    const user = dataEmail.items[0];
    if (user.password !== password) throw new Error("Mot de passe incorrect");
    return user;
  }

  const user = data.items[0];
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
  const res = await fetch(`${API_BASE}/tracks/by/title/${query}`);
  const data = await res.json();
  return data.items || [];
}
