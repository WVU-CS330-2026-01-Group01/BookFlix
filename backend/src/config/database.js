const fs = require("node:fs");

const mysql = require("mysql2/promise");

const env = require("./env");

let pool;

function assertDatabaseConfig() {
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
  if (!pool) {
    pool = mysql.createPool(createConnectionConfig());
  }

  return pool;
}

async function getDatabaseStatus() {
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
