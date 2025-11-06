
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

## 📂 Structure complète du backend

```
soundsync/
├── backend/
│ ├── app/
│ │ ├── api/
│ │ │ └── v1/
│ │ │ ├── collections_api.py # Endpoints CRUD génériques
│ │ │ ├── health_api.py # Endpoint de test API
│ │ │ ├── init_db_api.py # Initialisation/clean de la DB
│ │ │ └── init.py
│ │ │
│ │ ├── core/
│ │ │ ├── settings.py # Configuration et variables d'environnement
│ │ │ ├── events.py # Connexions MongoDB / Redis
│ │ │ └── init.py
│ │ │
│ │ ├── db/
│ │ │ ├── collections.py # Définition des collections Mongo
│ │ │ ├── crud.py # Opérations CRUD génériques
│ │ │ ├── mongo.py # Connexion MongoDB
│ │ │ ├── redis.py # Connexion Redis
│ │ │ └── init.py
│ │ │
│ │ ├── data/
│ │ │ ├── Artists/ # Données mock pour initialisation
│ │ │ └── Users/
│ │ │
│ │ ├── models/
│ │ │ ├── playlist.py
│ │ │ ├── track.py
│ │ │ └── user.py
│ │ │
│ │ ├── services/
│ │ │ ├── artist_service.py
│ │ │ ├── playlist_service.py
│ │ │ ├── track_service.py
│ │ │ ├── user_service.py
│ │ │ └── init.py
│ │ │
│ │ ├── utils/
│ │ │ ├── auth.py # Authentification / JWT
│ │ │ └── redis_cache.py # Helpers pour Redis
│ │ │
│ │ ├── static/
│ │ │ └── audio/ # Fichiers audio mock
│ │ │
│ │ ├── tests/
│ │ │ ├── test_collections_api.py
│ │ │ ├── test_users_api.py
│ │ │ ├── conftest.py
│ │ │ └── utils/
│ │ │
│ │ ├── main.py # Point d’entrée FastAPI (uvicorn app.main:app)
│ │ └── init.py
│ │
│ ├── Dockerfile
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ │ ├── components/ # Composants réutilisables (Navbar, Player, etc.)
│ │ ├── context/ # Contexte React (AuthContext)
│ │ ├── pages/ # Pages principales (Home, Login, Artists, etc.)
│ │ ├── routes/ # Définition des routes React
│ │ ├── services/ # API frontend → backend
│ │ └── static/css/ # Feuilles de style spécifiques par page
│ │
│ ├── public/
│ ├── eslint.config.js
│ ├── vite.config.js
│ ├── package.json
│ ├── package-lock.json
│ └── index.html
│
├── docker-compose.yml
└── readme.md
```

---

## 🧠 Explication des dossiers principaux

| Dossier / Fichier             | Rôle                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| **backend/app/api/**          | Contient les routes FastAPI (v1, healthcheck, init_db, etc.)                             |
| **backend/app/core/**         | Paramètres, gestion des événements, configuration d’environnement                         |
| **backend/app/db/**           | Gestion des connexions et opérations sur MongoDB / Redis                                 |
| **backend/app/services/**     | Logique métier (users, playlists, artistes, etc.)                                        |
| **backend/app/models/**       | Schémas Pydantic pour validation et typage des données                                   |
| **backend/app/data/**         | Données JSON pour initialiser la base (mock data)                                        |
| **backend/app/utils/**        | Fonctions utilitaires : auth JWT, cache Redis                                            |
| **backend/app/tests/**        | Tests unitaires et d’intégration (Pytest)                                                |
| **frontend/src/**             | Code source React (pages, composants, logique front)                                     |
| **frontend/src/static/css/**  | Styles CSS par page ou composant                                                         |

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
docker compose down   # dans le dossier avec docker-compose.yml
```

### Rebuild complet :

```bash
docker compose up -d --build
```

## DB manipulations :

Vu que les POST ne sont pas autorisé en navigateur, pour réinitialiser la base de données, il faut utiliser la borne de commandes : 
```
>>> curl.exe -X POST http://localhost:8000/api/clean_db
>>> curl.exe -X POST http://localhost:8000/api/init_db
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

🖋️ **Auteurs :** Valatras, Muten-Roshi-Sama