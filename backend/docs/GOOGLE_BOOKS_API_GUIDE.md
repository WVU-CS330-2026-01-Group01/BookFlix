# Google Books Backend API

## Folder Layout

```text
backend/
  .env
  .env.example
  package.json
  package-lock.json
  docs/
    GOOGLE_BOOKS_API_GUIDE.md
    GOOGLE_BOOKS_DATA_FLOW_DIAGRAM.md
  src/
    app.js
    server.js
    config/
      env.js
    routes/
      googleBooksRoutes.js
    services/
      googleBooksClient.js
```

What goes where:

- `src/server.js`: starts the backend server
- `src/app.js`: configures Express and mounts routes
- `src/config/env.js`: loads environment variables once
- `src/routes/googleBooksRoutes.js`: backend routes the frontend can call
- `src/services/googleBooksClient.js`: low-level Google Books API reader
- `docs/GOOGLE_BOOKS_API_GUIDE.md`: developer docs for the Google Books backend
- `docs/GOOGLE_BOOKS_DATA_FLOW_DIAGRAM.md`: visual beginner-friendly Mermaid diagrams

## Install

From the `backend` folder:

```bash
npm install
```

## Run

Development:

```bash
npm run dev
```

Normal start:

```bash
npm start
```

The backend runs on:

```text
http://localhost:3000
```

## Environment Variables

In `backend/.env`:

```env
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

`GOOGLE_BOOKS_API_KEY` should be treated as required for normal application use.
The backend can technically call the public Google Books endpoints without a key, but in practice
anonymous requests hit low rate limits quickly and can return HTTP `429 Too Many Requests`
during ordinary book searching in the add-pair UI.

## How The Pieces Fit Together

1. The frontend calls your backend route.
2. The route lives in `src/routes/googleBooksRoutes.js`.
3. That route calls `src/services/googleBooksClient.js`.
4. The Google Books client sends the request to Google Books.
5. The backend returns JSON to the frontend.

For the visual version, see [GOOGLE_BOOKS_DATA_FLOW_DIAGRAM.md](./GOOGLE_BOOKS_DATA_FLOW_DIAGRAM.md).

## Frontend Example

```js
const baseUrl = import.meta.env.VITE_API_BASE;

const response = await fetch(
  `${baseUrl}/api/google-books/search?query=Dune&langRestrict=en&maxResults=10`
);

const data = await response.json();
```

## Available Routes

| Route | Purpose |
| :--- | :--- |
| `/api/google-books/` | quick route list |
| `/api/google-books/search` | search public Google Books volumes |
| `/api/google-books/details` | get one volume by Google Books volume ID |

## Main Functions In `googleBooksClient.js`

### Core

| Function | Purpose | Params | Returns |
| :--- | :--- | :--- | :--- |
| `createGoogleBooksClient(options)` | Creates the Google Books wrapper | `options?: { apiBaseUrl, fetchImpl }` | Google Books client object |
| `request(path, options)` | Calls a public Google Books GET endpoint | `path: string`, `options?: object` | Raw JSON |

### Public Volume Reads

| Function | Params | Returns |
| :--- | :--- | :--- |
| `searchVolumes(query, options)` | `query: string` | Paginated volume results |
| `getVolume(volumeId, options)` | `volumeId: string` | One volume object |

## Supported Query Options

Common search options you can pass through `/api/google-books/search`:

| Query key | Notes |
| :--- | :--- |
| `query` | required search text |
| `filter` | `partial`, `full`, `free-ebooks`, `paid-ebooks`, `ebooks` |
| `orderBy` | `relevance` or `newest` |
| `printType` | `all`, `books`, or `magazines` |
| `projection` | `full` or `lite` |
| `download` | currently `epub` |
| `langRestrict` | language code like `en` |
| `maxResults` | integer from `1` to `40` |
| `startIndex` | integer `0` or greater |

For `/api/google-books/details`, use:

| Query key | Notes |
| :--- | :--- |
| `id` | required Google Books volume ID |
| `projection` | `full` or `lite` |
| `country` | optional country code |
| `partner` | optional partner string |

## Beginner Tips

- Frontend code should call `/api/google-books/...`, not Google directly.
- Route logic belongs in `src/routes`.
- Google Books API logic belongs in `src/services`.
- App setup belongs in `src/app.js`.
- Server startup belongs in `src/server.js`.
- No OAuth flow is needed for the current backend integration.
- A Google Books API key should be configured in `backend/.env` for normal usage.
- If the key is missing, book search may still work briefly, but Google can rate-limit the app with HTTP `429` responses.
