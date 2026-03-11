const cors = require("cors");
const express = require("express");

const env = require("./config/env");
const { createGoogleBooksRouter } = require("./routes/googleBooksRoutes");
const { createTmdbRouter } = require("./routes/tmdbRoutes");

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
  }),
);
app.use(express.json());

app.get("/health", (request, response) => {
  response.json({
    ok: true,
    message: "Backend server is running.",
  });
});

app.use("/api/google-books", createGoogleBooksRouter());
app.use("/api/tmdb", createTmdbRouter());

module.exports = app;
