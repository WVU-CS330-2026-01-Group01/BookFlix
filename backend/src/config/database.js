const fs = require("node:fs");

const mysql = require("mysql2/promise");

const env = require("./env");

let pool;

function assertDatabaseConfig() {
  // The database name has a development default, but connection identity should
  // always come from the environment rather than being guessed in code.
  const missing = [
    ["DB_HOST", env.dbHost],
    ["DB_USER", env.dbUser],
    ["DB_PASSWORD", env.dbPassword],
    ["DB_NAME", env.dbName],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required database environment variables: ${missing.join(", ")}`);
  }
}

function getSslConfig() {
  // Read the CA lazily so test runs that never touch MySQL do not need local
  // certificate setup.
  if (!fs.existsSync(env.dbSslCaPath)) {
    throw new Error(`MySQL CA certificate was not found at ${env.dbSslCaPath}`);
  }

  return {
    ca: fs.readFileSync(env.dbSslCaPath),
    rejectUnauthorized: true,
  };
}

function createConnectionConfig(database = env.dbName) {
  assertDatabaseConfig();

  return {
    host: env.dbHost,
    user: env.dbUser,
    password: env.dbPassword,
    database,
    port: env.dbPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: getSslConfig(),
  };
}

function getPool() {
  // A single process-wide pool is enough for the small Express API and keeps
  // connection reuse consistent across routers.
  if (!pool) {
    pool = mysql.createPool(createConnectionConfig());
  }

  return pool;
}

async function getDatabaseStatus() {
  // Health checks verify both connectivity and the auth schema the app expects
  // before the server accepts normal traffic.
  const databasePool = getPool();
  const [databaseRows] = await databasePool.query("SELECT DATABASE() AS databaseName");
  const [versionRows] = await databasePool.query("SELECT VERSION() AS serverVersion");
  const [tableRows] = await databasePool.query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = 'users'
    `,
    [env.dbName],
  );

  return {
    ok: true,
    host: env.dbHost,
    port: env.dbPort,
    database: databaseRows[0]?.databaseName ?? env.dbName,
    serverVersion: versionRows[0]?.serverVersion ?? null,
    usersTableExists: Number(tableRows[0]?.count ?? 0) > 0,
    sslCaPath: env.dbSslCaPath,
  };
}

async function closePool() {
  // Tests and graceful shutdown both use this to release sockets cleanly.
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = null;
  await activePool.end();
}

module.exports = {
  closePool,
  getDatabaseStatus,
  getPool,
};
