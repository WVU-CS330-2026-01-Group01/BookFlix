# BookFlix

BookFlix is a CS330 group project that lets users discover, create, and vote on movie and book pairs.

## Team

- Tommy Hartmann
- Wyatt Nuzum
- Alaina
- Jennalyn Jardeleza
- Luke Williams
- Jackson Walraven
- Cameron Salgado

## Project Structure

```text
backend/        Express API, auth, TMDB, Google Books, MySQL access
frontend/app/   React + Vite frontend
docs/           Project documentation hub
```

## Quick Start

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd frontend/app
npm install
```

3. Configure backend environment variables in `backend/.env`.

4. Start the backend:

```bash
cd backend
npm run dev
```

5. Start the frontend:

```bash
cd frontend/app
npm run dev
```

## Documentation

- Project docs hub: [docs/README.md](./docs/README.md)
- Remote database setup: [docs/setup/remote-db.md](./docs/setup/remote-db.md)
- Auth integration archive: [docs/archive/sprint2-auth-integration-map.md](./docs/archive/sprint2-auth-integration-map.md)
- TMDB backend docs: [docs/integrations/tmdb/api-guide.md](./docs/integrations/tmdb/api-guide.md)
- Google Books backend docs: [docs/integrations/google-books/api-guide.md](./docs/integrations/google-books/api-guide.md)
