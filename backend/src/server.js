const app = require("./app");
const { closePool, getDatabaseStatus } = require("./config/database");
const env = require("./config/env");

async function startServer() {
  console.log(`Configured FRONTEND_ORIGIN=${env.frontendOrigin}`);

  const database = await getDatabaseStatus();
  console.log(`Successfully connected to MySQL ${database.database} at ${database.host}:${database.port}`);

  const server = app.listen(env.port, () => {
    console.log(`Backend server running at http://localhost:${env.port}`);
  });

  async function shutdown(signal) {
    console.log(`Received ${signal}, shutting down backend.`);

    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

startServer().catch(async (error) => {
  console.error("MySQL startup check failed:", error.message);
  await closePool().catch(() => {});
  process.exit(1);
});
