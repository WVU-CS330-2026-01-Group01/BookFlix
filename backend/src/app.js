const cors = require("cors");
const express = require("express");

const { getDatabaseStatus } = require("./config/database");
const env = require("./config/env");
const { createGoogleBooksRouter } = require("./routes/googleBooksRoutes");
const { createTmdbRouter } = require("./routes/tmdbRoutes");
const { createPairsRouter } = require("./routes/pairsRoutes");
const { createUserRouter } = require("./routes/userRoutes");


const app = express();




app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json());



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

app.use("/api/google-books", createGoogleBooksRouter());
app.use("/api/tmdb", createTmdbRouter());
app.use("/api/pairs", createPairsRouter());
app.use("/api/users", createUserRouter());

module.exports = app;
