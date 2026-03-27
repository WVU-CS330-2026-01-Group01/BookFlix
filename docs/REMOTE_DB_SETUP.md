# Remote DB Setup

This guide is for getting the backend connected to the shared Azure MySQL database.

## 1. Allow your personal IP in Azure

Before anything else, Azure must allow your current public IP address.

In Azure Portal, open the course MySQL Flexible Server and go to its `Networking` page.

On that page:

1. Add your current client/public IP address to the allowed firewall rules.
2. Save the change.

If your home IP changes later, you may need to do this again.

## 2. Pull the latest repo changes

Make sure you have the current backend changes locally.

## 3. Create your backend `.env`

In `backend/`, copy:

```bash
cp .env.example .env
```

Then fill in these values in `backend/.env`:

```ini
DB_HOST=your-server.mysql.database.azure.com
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=authdb
DB_PORT=3306
DB_SSL_CA_PATH=./config/DigiCertGlobalRootG2.crt.pem

PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
TMDB_TOKEN=...
GOOGLE_BOOKS_API_KEY=...
```

Notes:

- Do not commit `backend/.env`.
- The CA certificate file is already in `backend/config/`.
- The CA certificate was committed so the backend can use a known local SSL file path without each person keeping their own copy in `Downloads`.
- This matches the Sprint 2 example repo, which also committed the Azure MySQL CA certificate file.
- The CA certificate is not a password. It is a public certificate authority file used by the backend to verify the Azure MySQL server's TLS certificate and reject man-in-the-middle connections.

## 4. Install backend dependencies

From `backend/`:

```bash
npm install
```

## 5. Start the backend

From `backend/`:

```bash
npm run dev
```

Expected result:

- The server starts on port `3000`
- The backend connects to Azure MySQL over SSL

## 6. Verify the DB connection

Open these in a browser:

- `http://localhost:3000/health`
- `http://localhost:3000/health/db`

`/health/db` is only available when `NODE_ENV=development`.

You should see JSON showing the backend is running and the database connection is `ok: true`.

## 7. What the backend currently does on startup

On startup, the backend only checks that it can connect to the remote database.

It does not create, delete, or reset tables.

## Troubleshooting

If the DB connection fails:

- Make sure your public IP was added in Azure and the rule was saved
- Make sure your DB username and password are correct
- Make sure `DB_SSL_CA_PATH` points to `./config/DigiCertGlobalRootG2.crt.pem`
- Make sure you are running the backend from the `backend/` folder
