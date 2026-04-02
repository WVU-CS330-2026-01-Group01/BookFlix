# TMDB Backend API

## Folder Layout

```text
docs/
  integrations/
    tmdb/
      api-guide.md
      data-flow.md
backend/
  .env
  .env.example
  package.json
  package-lock.json
  src/
    app.js
    server.js
    config/
      env.js
    routes/
      tmdbRoutes.js
    services/
      tmdbClient.js
```

What goes where:

- `src/server.js`: starts the backend server
- `src/app.js`: configures Express and mounts routes
- `src/config/env.js`: loads environment variables once
- `src/routes/tmdbRoutes.js`: backend routes the frontend can call
- `src/services/tmdbClient.js`: low-level TMDB API reader
- `docs/integrations/tmdb/api-guide.md`: developer docs for the TMDB backend
- `docs/integrations/tmdb/data-flow.md`: visual diagrams for the request flow

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
TMDB_TOKEN=your_tmdb_read_access_token
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

## How The Pieces Fit Together

1. The frontend calls your backend route.
2. The route lives in `src/routes/tmdbRoutes.js`.
3. That route calls `src/services/tmdbClient.js`.
4. The TMDB client sends the request to TMDB.
5. The backend returns JSON to the frontend.

For the visual version, see [data-flow.md](./data-flow.md).

## Frontend Example

```js
const baseUrl = import.meta.env.VITE_API_BASE;

const response = await fetch(
  `${baseUrl}/api/tmdb/search?type=movie&query=Batman&language=en-US`
);

const data = await response.json();
```

## Available Routes

| Route | Purpose |
| :--- | :--- |
| `/api/tmdb/` | quick route list |
| `/api/tmdb/search` | search movies, shows, people, and more |
| `/api/tmdb/details` | get one main item by TMDB ID |
| `/api/tmdb/resource` | get credits, videos, images, and other sub-resources |
| `/api/tmdb/trending` | get trending content |
| `/api/tmdb/discover` | run discover filters |
| `/api/tmdb/image-url` | build a full image URL from a TMDB file path |

## Main Functions In `tmdbClient.js`

### Core

| Function | Purpose | Params | Returns |
| :--- | :--- | :--- | :--- |
| `createTmdbClient(options)` | Creates the TMDB wrapper | `options?: { token, apiBaseUrl, imageBaseUrl, fetchImpl }` | TMDB client object |
| `request(path, options)` | Calls any read-only TMDB GET endpoint | `path: string`, `options?: object` | Raw JSON |
| `validateKey()` | Tests auth | none | Success object |
| `buildImageUrl(filePath, size)` | Builds a TMDB image URL | `filePath: string \| null`, `size?: string` | `string \| null` |

### Static Reference Data

| Function | Params | Returns |
| :--- | :--- | :--- |
| `getConfiguration()` | none | TMDB config object |
| `getCountries()` | none | `Array<object>` |
| `getJobs()` | none | `Array<object>` |
| `getLanguages()` | none | `Array<object>` |
| `getPrimaryTranslations()` | none | `Array<string>` |
| `getTimezones()` | none | `Array<object>` |
| `getGenres(mediaType, options)` | `mediaType: "movie" \| "tv"` | `{ genres: Array<object> }` |

### Discovery

| Function | Params | Returns |
| :--- | :--- | :--- |
| `getTrending(mediaType, timeWindow, options)` | `mediaType: "all" \| "movie" \| "tv" \| "person"`, `timeWindow: "day" \| "week"` | Paginated results |
| `getList(mediaType, category, options)` | `mediaType: "movie" \| "tv" \| "person"` | Paginated list or latest item |
| `search(mediaType, query, options)` | `mediaType: "movie" \| "tv" \| "person" \| "collection" \| "company" \| "keyword" \| "multi"`, `query: string` | Paginated results |
| `discover(mediaType, filters)` | `mediaType: "movie" \| "tv"`, `filters: object` | Paginated results |
| `findByExternalId(externalId, externalSource, options)` | `externalId: string`, `externalSource: string` | Matches grouped by type |

### Details And Resources

| Function | Params | Returns |
| :--- | :--- | :--- |
| `getDetails(mediaType, id, options)` | `mediaType: "movie" \| "tv" \| "person"`, `id` | Detail object |
| `getResource(mediaType, id, resource, options)` | `mediaType`, `id`, `resource` | Resource object |
| `getTvSeasonDetails(tvId, seasonNumber, options)` | `tvId`, `seasonNumber` | TV season object |
| `getTvEpisodeDetails(tvId, seasonNumber, episodeNumber, options)` | `tvId`, `seasonNumber`, `episodeNumber` | TV episode object |

### Other Helpers

| Function | Params | Returns |
| :--- | :--- | :--- |
| `getChangeList(mediaType, options)` | `mediaType: "movie" \| "tv" \| "person"` | Changed IDs |
| `getItemChanges(mediaType, id, options)` | `mediaType`, `id` | Change history |
| `getCollectionDetails(collectionId, options)` | `collectionId` | Collection object |
| `getCompanyDetails(companyId, options)` | `companyId` | Company object |
| `getNetworkDetails(networkId, options)` | `networkId` | Network object |
| `getKeywordDetails(keywordId, options)` | `keywordId` | Keyword object |
| `getAccountDetails(accountId, sessionId)` | `accountId`, `sessionId` | Account object |

## Query Aliases

These JavaScript option names are converted to TMDB query names automatically:

| JavaScript key | TMDB key |
| :--- | :--- |
| `appendToResponse` | `append_to_response` |
| `includeImageLanguage` | `include_image_language` |
| `sessionId` | `session_id` |
| `externalSource` | `external_source` |

## Beginner Tips

- Frontend code should call `/api/tmdb/...`, not TMDB directly.
- Route logic belongs in `src/routes`.
- TMDB API logic belongs in `src/services`.
- App setup belongs in `src/app.js`.
- Server startup belongs in `src/server.js`.
