# Google Books API Flow Diagram

This page shows how the Google Books backend works in a visual way.

The most important idea is:

- the frontend asks the backend
- the backend asks Google Books

## Big Picture

```mermaid
flowchart LR
    A[Frontend React App<br/>localhost:5173] -->|fetch /api/google-books/search| B[Express Route<br/>src/routes/googleBooksRoutes.js]
    B -->|calls function| C[Google Books Client Service<br/>src/services/googleBooksClient.js]
    C -->|GET request| D[Google Books API<br/>www.googleapis.com]
    D -->|JSON response| C
    C -->|plain JS object| B
    B -->|JSON response| A

    style D fill:#d9f2ff,stroke:#2b6cb0,stroke-width:2px
    style A fill:#e6fffa,stroke:#2f855a,stroke-width:2px
```

## Security View

```mermaid
flowchart TD
    A[Browser / Frontend] -->|Can see| B[Backend Route URL]
    B --> D[Backend Server]
    D --> E[Google Books API]

    F[Good Backend Rule] --> G[Frontend calls your backend routes]
    F --> H[Backend owns third-party API logic]

    style F fill:#fefcbf,stroke:#b7791f,stroke-width:2px
```

## Step-By-Step Request Flow

```mermaid
sequenceDiagram
    participant User as User in Browser
    participant Frontend as Frontend Code
    participant Route as Express Route
    participant Service as Google Books Client
    participant Books as Google Books API

    User->>Frontend: Clicks Search
    Frontend->>Route: GET /api/google-books/search?query=Dune
    Route->>Service: googleBooks.searchVolumes("Dune", {...})
    Service->>Books: GET /books/v1/volumes?q=Dune
    Books-->>Service: JSON search results
    Service-->>Route: Plain JS object
    Route-->>Frontend: res.json(data)
    Frontend-->>User: Show book results on the page
```

## What Each File Does

```mermaid
flowchart TB
    A[src/server.js] -->|starts| B[src/app.js]
    B -->|mounts| C[src/routes/googleBooksRoutes.js]
    C -->|uses| D[src/services/googleBooksClient.js]
    D -->|reads config from| E[src/config/env.js]
    D -->|calls| F[Google Books API]
```

### 1. Frontend

The frontend is the React app. It should use `fetch()` to call a backend route, like:

```js
fetch("http://localhost:3000/api/google-books/search?query=Dune");
```

### 2. Route

The route is the backend URL that listens for the frontend request.

Example:

```text
/api/google-books/search
```

That route lives in:

```text
src/routes/googleBooksRoutes.js
```

### 3. Service

The service is the file that actually knows how to talk to Google Books.

That file lives in:

```text
src/services/googleBooksClient.js
```

It sends the real request to Google Books.

## Why This Is Better Than Calling Google Books Directly From The Frontend

- We can change Google Books logic in one backend place.
- The frontend only needs to learn our own app routes.
- This is closer to how production apps are usually built.
