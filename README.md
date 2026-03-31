# Gestion Pharmacies

Application de gestion de pharmacie avec :

- portail web clients en `React + Vite`
- administration interne desktop en `Electron`
- backend `Node.js + Express`
- base de donnees `MongoDB`

## Modes de fonctionnement

- `web client` : consultation, demandes, commandes, reservations
- `desktop admin` : stock, demandes clients, comptes internes
- `backend central` : logique metier commune et base unique

## Lancement local

Frontend web :

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

## Desktop admin

Commandes utiles :

```bash
npm run desktop:dev
npm run desktop:win
```

Artefacts Windows generes :

- [release/gestion-pharmacies-admin-0.0.0-setup.exe](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/release/gestion-pharmacies-admin-0.0.0-setup.exe)
- [release/win-unpacked](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/release/win-unpacked)

Configuration desktop :

- [electron/main.cjs](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/electron/main.cjs)
- [electron/preload.cjs](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/electron/preload.cjs)
- [electron-builder.cjs](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/electron-builder.cjs)

## Auto-update desktop

Le packaging Electron lit `DESKTOP_UPDATES_URL` au moment du build.

Exemple :

```bash
$env:DESKTOP_UPDATES_URL="https://updates.example.com/gestion-pharmacies/"
npm run desktop:win
```

Les fichiers de mise a jour produits sont :

- `latest.yml`
- `*.blockmap`
- `*.exe`

Ils doivent etre publies ensemble sur le serveur de mise a jour.

## Variables d'environnement

Frontend / packaging :

- [\.env.example](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/.env.example)

Backend :

- [backend/.env.example](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/backend/.env.example)

Variables backend importantes :

- `MONGODB_URI`
- `JWT_SECRET`
- `ALLOWED_WEB_ORIGINS`

`ALLOWED_WEB_ORIGINS` accepte une liste separee par des virgules. Les requetes desktop locales restent autorisees.

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

- L'icone desktop utilise [build/icons/app-icon.ico](/C:/Users/DJOBA%20MICHELE/Desktop/gestion-pharmacies/build/icons/app-icon.ico).
- Le backend expose un endpoint de sante `GET /health`.
- Les images uploades sont stockees dans un volume Docker dedie.
