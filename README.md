# Gestion Pharmacies

Application de gestion de pharmacie avec :

- frontend React + Vite
- backend Node.js + Express
- base de donnees MongoDB

## Lancement local

Frontend :

```bash
npm install
npm run dev
```

Backend :

```bash
cd backend
npm install
node app.js
```

Le frontend utilise `http://localhost:3000` par defaut pour l'API.

## Lancement avec Docker

Prerequis :

- Docker
- Docker Compose

Commande :

```bash
docker compose up --build
```

Services exposes :

- frontend : http://localhost:8080
- backend : http://localhost:3000
- mongo : mongodb://localhost:27017

Le frontend Docker passe par Nginx et proxifie :

- `/api/*` vers le backend
- `/uploads/*` vers le backend

## Structure Docker

- [Dockerfile](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/Dockerfile) : build et service du frontend
- [backend/Dockerfile](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/backend/Dockerfile) : backend Express
- [docker-compose.yml](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/docker-compose.yml) : orchestration frontend/backend/mongo
- [docker/nginx/default.conf](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/docker/nginx/default.conf) : proxy Nginx

## Notes

- Les images uploades sont stockees dans un volume Docker dedie.
- La connexion Mongo utilise `MONGODB_URI` si definie, sinon `mongodb://localhost:27017/medicaments`.
- Le `backend/tsconfig.json` a ete simplifie pour eviter les erreurs visuelles inutiles dans l'IDE.
