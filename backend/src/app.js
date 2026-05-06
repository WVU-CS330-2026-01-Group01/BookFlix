const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");

const { getDatabaseStatus } = require("./config/database");
const env = require("./config/env");
const { createAuthRouter } = require("./routes/authRoutes");
const { createGoogleBooksRouter } = require("./routes/googleBooksRoutes");
const { createTmdbRouter } = require("./routes/tmdbRoutes");
const { createPairsRouter } = require("./routes/pairsRoutes");
const { createUserRouter } = require("./routes/userRoutes");

const app = express();

// Honor Azure/App Service proxy headers so secure cookies and client IPs behave
// correctly after the request passes through the platform edge.
if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

// The React app talks to the API with cookie credentials, so CORS and cookie
// parsing have to be configured before any route handlers run.
app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", async (request, response) => {
  response.json({
    ok: true,
    message: "Backend server is running.",
  });
});

// Keep the database probe out of production; it exposes deployment details that
// are useful locally but not part of the public API surface.
if (env.nodeEnv === "development") {
  app.get("/health/db", async (request, response) => {
    const database = await getDatabaseStatus();
    response.json(database);
  });
}

// Feature routers keep auth, external API proxying, pair data, and user profiles
// separated while sharing the same Express app and cookie session.
app.use("/auth", createAuthRouter());
app.use("/api/google-books", createGoogleBooksRouter());
app.use("/api/tmdb", createTmdbRouter());
app.use("/api/pairs", createPairsRouter());
app.use("/api/users", createUserRouter());

module.exports = app;
