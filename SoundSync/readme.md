
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

Parfait ✅ — on va poser une **structure claire et extensible** pour ton backend FastAPI.
C’est une architecture **modulaire**, **propre** et **scalable**, inspirée des bonnes pratiques du monde pro (ex : FastAPI + MongoDB + Redis).

---

## 📂 Structure complète du backend

```
backend/
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── health.py           # Endpoint de test
│   │       └── users.py            # Exemple de route (users)
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # Configuration générale (env vars)
│   │   └── events.py               # Connexions à Mongo et Redis
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── mongo.py                # Connexion MongoDB
│   │   └── redis_client.py         # Connexion Redis
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── user_model.py           # Modèle Pydantic pour User
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   └── user_service.py         # Logique métier (users)
│   │
│   ├── main.py                     # Point d’entrée FastAPI
│   └── __init__.py
│
└── requirements.txt
```

---

## 🧠 Explication des dossiers

| Dossier       | Rôle                                                                                                       | Exemple                              |
| ------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **api/**      | Routes de l’API (v1, v2, etc.). Contient les endpoints que les clients (frontend, mobile, etc.) appellent. | `/api/v1/users`, `/api/v1/health`    |
| **core/**     | Fichiers centraux : configuration, événements de démarrage, variables d’environnement.                     | Connexion à Mongo/Redis au lancement |
| **db/**       | Gestion directe des bases de données et des connexions.                                                    | Mongo client, Redis client           |
| **models/**   | Définitions des schémas Pydantic et/ou ORM.                                                                | `User`, `Playlist`, `Song`, etc.     |
| **services/** | Logique métier : fonctions de traitement, appels DB, validations.                                          | Création utilisateur, login, etc.    |

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
## Pytests (CRUD):

Run the docker, initialize the database (optionnal)
Run:
```
# Run all tests in the new file
pytest tests/test_collections_api.py -v -s

# Run only CRUD flow tests for all collections
pytest tests/test_collections_api.py::test_crud_flow_all_collections -v -s


# Run only pagination tests
pytest tests/test_collections_api.py::test_get_all_pagination -v -s

# Run only sorting tests
pytest tests/test_collections_api.py::test_get_all_with_sort -v -s

# Run all tests with coverage
pytest tests/test_collections_api.py --cov=app -v -s
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

🖋️ **Auteur :** Valatras