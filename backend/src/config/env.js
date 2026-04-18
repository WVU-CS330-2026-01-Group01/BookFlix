const path = require("node:path");

const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

// Demo branch: remote MySQL was deleted. These defaults let the app run without
// any .env file or API keys from the user — the baked-in tokens below have
// read-only scope on TMDB/Google Books and are used solely to seed the local
// mock database with real movie + book metadata.
const DEMO_TMDB_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NGJkOGQ3YzgxMTNhZWVmN2YyOGM3NDMwYmNjMWE1ZCIsIm5iZiI6MTc2OTQ1OTM1NS40NjUsInN1YiI6IjY5NzdjZTliOTUxMWFkMDg5MmEzN2EyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cdws_WVDexpIyMpGyMEehMmPW_V7AZgRm9n3OpeuBqQ";
const DEMO_GOOGLE_BOOKS_KEY = "AIzaSyCmW-Opy00xSJ7GXk6Wd5T6kSTNkvrWspI";

const defaultDbSslCaPath = path.resolve(__dirname, "../../config/DigiCertGlobalRootG2.crt.pem");

module.exports = {
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || "bookflix-dev-jwt-secret",
  authCookieName: process.env.AUTH_COOKIE_NAME || "token",
  authCookieMaxAgeMs: Number(process.env.AUTH_COOKIE_MAX_AGE_MS) || 60 * 60 * 1000,
  authCookieSameSite: process.env.AUTH_COOKIE_SAME_SITE || "strict",
  tmdbToken: process.env.TMDB_TOKEN || DEMO_TMDB_TOKEN,
  googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY || DEMO_GOOGLE_BOOKS_KEY,
  dbHost: process.env.DB_HOST || "",
  dbUser: process.env.DB_USER || "",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "authdb",
  dbPort: Number(process.env.DB_PORT) || 3306,
  dbSslCaPath: process.env.DB_SSL_CA_PATH
    ? path.resolve(path.dirname(envPath), process.env.DB_SSL_CA_PATH)
    : defaultDbSslCaPath,
};
