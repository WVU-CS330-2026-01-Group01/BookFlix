// Demo branch: remote MySQL was deleted. This module now wraps a local
// JSON-backed mock pool so the UI can be exercised without a database.
const mockPool = require("./mockPool");

async function getDatabaseStatus() {
  const store = mockPool.getStore();
  return {
    ok: true,
    host: "mock",
    port: 0,
    database: "mock_db.json",
    serverVersion: "mock",
    usersTableExists: Array.isArray(store.users),
    sslCaPath: null,
  };
}

async function closePool() {
  await mockPool.getPool().end();
}

module.exports = {
  closePool,
  getDatabaseStatus,
  getPool: mockPool.getPool,
};
