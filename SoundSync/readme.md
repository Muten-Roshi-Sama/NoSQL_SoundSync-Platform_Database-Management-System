
# 🎵 Soundsync

**Soundsync** est une application web de streaming musical inspirée de Spotify.  
Elle permet aux utilisateurs d’écouter des morceaux, créer des playlists, suivre des artistes et découvrir de nouveaux genres.

---

## 🧱 Technologies

- **Backend** : [FastAPI](https://fastapi.tiangolo.com/)  
- **Base de données principale** : [MongoDB](https://www.mongodb.com/)  
- **Cache / files d’attente** : [Redis](https://redis.io/)  
- **Frontend** : [React (Vite)](https://vitejs.dev/)  
- **Containerisation** : [Docker Compose](https://docs.docker.com/compose/)

---

## 📂 Structure du projet

```

soundsync/
├─ backend/
│  ├─ app/
│  │  ├─ __init__.py
│  │  ├─ main.py                 # uvicorn app.main:app
│  │  ├─ core/
│  │  │  ├─ settings.py          # pydantic Settings (env)
│  │  │  └─ events.py            # startup/shutdown events (db connect)
│  │  ├─ db/
│  │  │  ├─ client.py            # PyMongo client management
│  │  │  └─ indexes.py
│  │  ├─ api/
│  │  │  ├─ v1/
│  │  │  │  ├─ __init__.py
│  │  │  │  ├─ users.py
│  │  │  │  ├─ tracks.py
│  │  │  │  └─ playlists.py
│  │  ├─ models/                 # Pydantic schemas (requests/responses)
│  │  │  ├─ user.py
│  │  │  ├─ track.py
│  │  │  └─ playlist.py
│  │  ├─ services/               # logique métier, accès DB → réutilisable
│  │  │  ├─ user_service.py
│  │  │  ├─ track_service.py
│  │  │  └─ playlist_service.py
│  │  ├─ utils/
│  │  │  ├─ redis_cache.py       # helpers Redis (cache, counters)
│  │  │  └─ auth.py              # JWT helpers, oauth utilities
│  │  └─ tests/
│  │     └─ ...
│  ├─ Dockerfile
│  └─ requirements.txt
├─ frontend/
│  └─ (app React stub / create-react-app or Vite)
├─ docker-compose.yml
└─ README.md

```


---

## ⚙️ Installation et lancement

### 🐳 Prérequis

- [Docker](https://www.docker.com/) installé  
- [Docker Compose](https://docs.docker.com/compose/install/) installé  

Aucune autre installation locale n’est nécessaire (pas besoin de Node ou Python en dehors de Docker).

---

### 🚀 Démarrage du projet

Depuis la racine du projet :

```bash
docker compose up --build
````

Docker va :

* construire les images du **backend FastAPI** et du **frontend React**,
* lancer **MongoDB** et **Redis**,
* relier tous les services dans un réseau interne.

---

## 🌐 Accès à l’application

| Service               | URL d’accès depuis le navigateur               | Description                                             |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| **Frontend (React)**  | [http://localhost:3000](http://localhost:3000) | Interface web principale                                |
| **Backend (FastAPI)** | [http://localhost:8000](http://localhost:8000) | API Soundsync (Swagger UI disponible)                   |
| **MongoDB**           | `mongodb://localhost:27017`                    | Base de données (non accessible via navigateur)         |
| **Redis**             | `redis://localhost:6379`                       | Cache / files d’attente (non accessible via navigateur) |

---

## 🧪 Test de la communication frontend ↔ backend

Une fois Docker lancé :

* Va sur [http://localhost:3000](http://localhost:3000)
* Tu devrais voir :

  ```
  Soundsync Frontend
  API Status: Welcome to the Soundsync API! DB connected.
  ```

Cela confirme que le **frontend communique bien avec le backend**.

---

## 🧰 Commandes utiles

### Arrêter les conteneurs :

```bash
docker compose down
```

### Rebuild complet :

```bash
docker compose up --build
```

### Voir les logs :

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 📘 Notes techniques

* Le **frontend** accède à l’API via `http://localhost:8000` (le port exposé).
* Le **CORS** est activé dans FastAPI pour autoriser `http://localhost:3000`.
* En production, cette configuration sera ajustée pour pointer vers le domaine final.

---

## 🚧 Prochaines étapes

* [ ] Définir le modèle utilisateur (User, Artist, Playlist, etc.)
* [ ] Ajouter un système d’authentification (JWT)
* [ ] Implémenter la gestion des fichiers audio (upload/stream)
* [ ] Créer une interface utilisateur complète (Playlists, Player, etc.)

---

🖋️ **Auteur :** [Ton nom ici]
📅 **Version :** 0.1.0

```

---

Souhaites-tu que je t’ajoute dans ce README la partie *“développement sans Docker”* (pour lancer backend et frontend séparément avec `uvicorn` et `npm run dev` quand tu veux coder plus vite) ?
```
