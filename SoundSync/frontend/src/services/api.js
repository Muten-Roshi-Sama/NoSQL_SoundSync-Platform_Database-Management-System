// src/services/api.js


// BACKEND Paths :
      //-----------------------------------CRUD--------------------------------------------
      // GET      /crud/{collection}                     : List documents (supports filter, sort, projection, skip, limit)
      // GET      /crud/{collection}/by/{field}/{value}  : Get document(s) by field
      // GET      /crud/{collection}/count               : Count documents (supports filter)
      // GET      /crud/tracks/search                    : Search tracks by title/artist
      // POST     /crud/{collection}                     : Create document
      // PUT      /crud/{collection}/by/{id}             : Update document by ID
      // DELETE   /crud/{collection}/by/{id}             : Delete document by ID
      //-----------------------------------Others--------------------------------------------
      // POST     /api/init_db                           :  Initialize db with data folders
      // POST     /api/clean_db                          :  Deep clean db.


const API_BASE = "http://127.0.0.1:8000";







// ======= General CRUD Functions =======

// ---------- GET ----------
export async function getAll(collection, { filter, sort, projection, skip = 0, limit = 50 } = {}) {
  const params = [];
  if (filter) params.push(`filter=${encodeURIComponent(JSON.stringify(filter))}`);
  if (sort) params.push(`sort=${encodeURIComponent(JSON.stringify(sort))}`);
  if (projection) params.push(`projection=${encodeURIComponent(JSON.stringify(projection))}`);
  if (skip) params.push(`skip=${skip}`);
  if (limit) params.push(`limit=${limit}`);
  //
  const url = `${API_BASE}/crud/${collection}?${params.join('&')}`;
  const res = await fetch(url);
  return await res.json(); // { items, total, skip, limit }
}

export async function getByField(collection, field, value, { projection, skip = 0, limit = 50 } = {}) {
  const params = [];
  if (projection) params.push(`projection=${encodeURIComponent(JSON.stringify(projection))}`);
  if (skip) params.push(`skip=${skip}`);
  if (limit) params.push(`limit=${limit}`);
  //
  const url = `${API_BASE}/crud/${collection}/by/${field}/${value}?${params.join('&')}`;
  const res = await fetch(url);
  return await res.json(); // { document } or { items, total, ... }
}

export async function countDocuments(collection, filter) {
  const params = [];
  if (filter) params.push(`filter=${encodeURIComponent(JSON.stringify(filter))}`);
  //
  const url = `${API_BASE}/crud/${collection}/count?${params.join('&')}`;
  const res = await fetch(url);
  return await res.json(); // { count }
}


export async function getFieldFromAll(collection, field) {
  /// get all distinct values for a field within a specific collection
  //
  const url = `${API_BASE}/crud/meta/get_field_from_all/${encodeURIComponent(collection)}/${encodeURIComponent(field)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const msg = res.status === 404 ? `Collection '${collection}' not found` : `Failed to fetch field values (${res.status})`;
    throw new Error(msg);
  }
  const data = await res.json();
  // Full payload is: { collection, field, count, values }
  return data.values || [];
}




// ----------- POST / PUT / DELETE ----------
export async function createDocument(collection, data) {
  const url = `${API_BASE}/crud/${collection}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json(); // { id, message }
}

export async function updateDocument(collection, id, updates) {
  const url = `${API_BASE}/crud/${collection}/by/${id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return await res.json(); // { modified, message }
}

export async function deleteDocument(collection, id) {
  const url = `${API_BASE}/crud/${collection}/by/${id}`;
  const res = await fetch(url, { method: 'DELETE' });
  return await res.json(); // { deleted, message }
}


// Supprimer un document selon un filtre (ex: like pour un user + track)
export async function deleteDocumentByFilter(collection, filter) {
  // Récupérer le document correspondant au filtre
  const res = await getAll(collection, { filter, limit: 1 });
  if (res.items.length === 0) return { deleted: false, message: "Rien à supprimer" };
  const id = res.items[0]._id;
  return await deleteDocument(collection, id);
}


// ------------ Meta -------------
export async function listCollectionNames() {
  const url = `${API_BASE}/crud/meta/list_collection_names`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch collection names (${res.status})`);
  const data = await res.json();
  return data.collections || [];
}





// ========== Implementations ==========

export async function loginUser(identifier, password) {
  // 1️⃣ Essayer via username
  let res = await fetch(`${API_BASE}/crud/users/by/username/${identifier}`);
  let data = await res.json();

  // Si 404, on tente via email
  if (res.status === 404) {
    res = await fetch(`${API_BASE}/crud/users/by/email/${identifier}`);
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
  const res = await fetch(`${API_BASE}/crud/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) throw new Error("Erreur lors de la création du compte");
  return await res.json();
}






