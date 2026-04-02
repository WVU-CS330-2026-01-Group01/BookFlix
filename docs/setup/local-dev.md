# Local Development

This guide covers the normal local development workflow for BookFlix.

## Services

- Frontend: React + Vite in `frontend/app`
- Backend: Express API in `backend`
- Database: Azure MySQL configured through `backend/.env`

## 1. Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend/app
npm install
```

## 2. Configure The Backend

Create `backend/.env` and make sure it includes at least:

```ini
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-local-dev-secret
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=authdb
DB_PORT=3306
DB_SSL_CA_PATH=./config/DigiCertGlobalRootG2.crt.pem
TMDB_TOKEN=...
GOOGLE_BOOKS_API_KEY=...
```

If you need the shared Azure DB setup steps, use [remote-db.md](./remote-db.md).

## 3. Start The Backend

```bash
cd backend
npm run dev
```

Expected local backend URL:

```text
http://localhost:3000
```

## 4. Start The Frontend

```bash
cd frontend/app
npm run dev
```

Expected local frontend URL:

```text
http://localhost:5173
```

## 5. Auth In Local Dev

- The frontend calls the backend with `credentials: "include"`.
- The backend sets an HTTP-only auth cookie after login.
- The frontend checks `/auth/test` on startup to restore session state.
- Protected routes currently include `/pair` and `/user`.

## 6. Useful Checks

- Backend health: `http://localhost:3000/health`
- Backend DB health in development: `http://localhost:3000/health/db`
- Frontend app: `http://localhost:5173`
