const path = require("node:path");

const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

const defaultDbSslCaPath = path.resolve(__dirname, "../../config/DigiCertGlobalRootG2.crt.pem");

module.exports = {
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  tmdbToken: process.env.TMDB_TOKEN,
  dbHost: process.env.DB_HOST || "",
  dbUser: process.env.DB_USER || "",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "authdb",
  dbPort: Number(process.env.DB_PORT) || 3306,
  dbSslCaPath: process.env.DB_SSL_CA_PATH
    ? path.resolve(path.dirname(envPath), process.env.DB_SSL_CA_PATH)
    : defaultDbSslCaPath,
};
