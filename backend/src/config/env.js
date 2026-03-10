const path = require("node:path");

const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  port: Number(process.env.PORT) || 3000,
  tmdbToken: process.env.TMDB_TOKEN,
};
