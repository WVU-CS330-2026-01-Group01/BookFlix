const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");

const { getDatabaseStatus } = require("./config/database");
const env = require("./config/env");
const { createAuthRouter } = require("./routes/authRoutes");
const { createGoogleBooksRouter } = require("./routes/googleBooksRoutes");
const { createTmdbRouter } = require("./routes/tmdbRoutes");
const { createPairsRouter } = require("./routes/pairsRoutes");

const app = express();

if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

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

if (env.nodeEnv === "development") {
  app.get("/health/db", async (request, response) => {
    const database = await getDatabaseStatus();
    response.json(database);
  });
}

app.use("/auth", createAuthRouter());
app.use("/api/google-books", createGoogleBooksRouter());
app.use("/api/tmdb", createTmdbRouter());
app.use("/api/pairs", createPairsRouter());

module.exports = app;
