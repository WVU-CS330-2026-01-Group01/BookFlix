# TMDB API Flow Diagram

This page shows how the TMDB backend works in a visual way.

The most important idea is:

- the frontend asks the backend
- the backend asks TMDB
- the secret TMDB token stays in the backend

## Big Picture

```mermaid
flowchart LR
    A[Frontend React App<br/>localhost:5173] -->|fetch /api/tmdb/search| B[Express Route<br/>src/routes/tmdbRoutes.js]
    B -->|calls function| C[TMDB Client Service<br/>src/services/tmdbClient.js]
    C -->|GET request with Bearer token| D[TMDB API<br/>api.themoviedb.org]
    D -->|JSON response| C
    C -->|plain JS object| B
    B -->|JSON response| A

    E[backend/.env<br/>TMDB_TOKEN] -->|read by backend only| C

    style E fill:#ffe9b3,stroke:#b7791f,stroke-width:2px
    style D fill:#d9f2ff,stroke:#2b6cb0,stroke-width:2px
    style A fill:#e6fffa,stroke:#2f855a,stroke-width:2px
```

## Security View

```mermaid
flowchart TD
    A[Browser / Frontend] -->|Can see| B[Backend Route URL]
    A -. cannot see .-> C[TMDB_TOKEN]
    B --> D[Backend Server]
    D --> C[TMDB_TOKEN in .env]
    D --> E[TMDB API]

    F[Good Security Rule] --> G[Keep secrets on the server]
    F --> H[Frontend never calls TMDB directly with the token]
    F --> I[Frontend only calls your own backend routes]

    style C fill:#fed7d7,stroke:#c53030,stroke-width:2px
    style F fill:#fefcbf,stroke:#b7791f,stroke-width:2px
```

## Step-By-Step Request Flow

```mermaid
sequenceDiagram
    participant User as User in Browser
    participant Frontend as Frontend Code
    participant Route as Express Route
    participant Service as TMDB Client
    participant TMDB as TMDB API

    User->>Frontend: Clicks Search
    Frontend->>Route: GET /api/tmdb/search?type=movie&query=Batman
    Route->>Service: tmdb.search("movie", "Batman", {...})
    Service->>TMDB: GET /3/search/movie + Authorization: Bearer TMDB_TOKEN
    TMDB-->>Service: JSON search results
    Service-->>Route: Plain JS object
    Route-->>Frontend: res.json(data)
    Frontend-->>User: Show movie results on the page
```

## What Each File Does

```mermaid
flowchart TB
    A[src/server.js] -->|starts| B[src/app.js]
    B -->|mounts| C[src/routes/tmdbRoutes.js]
    C -->|uses| D[src/services/tmdbClient.js]
    D -->|reads config from| E[src/config/env.js]
    D -->|calls| F[TMDB API]
```

### 1. Frontend

The frontend is the React app. It should use `fetch()` to call a backend route, like:

```js
fetch("http://localhost:3000/api/tmdb/search?type=movie&query=Batman");
```

### 2. Route

The route is the backend URL that listens for the frontend request.

Example:

```text
/api/tmdb/search
```

That route lives in:

```text
src/routes/tmdbRoutes.js
```

### 3. Service

The service is the file that actually knows how to talk to TMDB.

That file lives in:

```text
src/services/tmdbClient.js
```

It adds the Bearer token and sends the real request to TMDB.

### 4. Secret Token

The token is stored in:

```text
backend/.env
```

That is safer because the browser never needs to see it.

## Why This Is Better Than Calling TMDB Directly From The Frontend

- The TMDB token stays private.
- We can change TMDB logic in one backend place.
- The frontend only needs to learn our own app routes.
- This is closer to how production apps are usually built.