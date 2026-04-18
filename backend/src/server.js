const app = require("./app");
const { closePool, getDatabaseStatus } = require("./config/database");
const env = require("./config/env");
const { seedIfEmpty } = require("./config/seed");

async function startServer() {
  console.log(`Configured FRONTEND_ORIGIN=${env.frontendOrigin}`);

  await seedIfEmpty();

  const database = await getDatabaseStatus();
  console.log(`Using mock ${database.database} (remote MySQL is offline — demo mode).`);

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
  console.error("Startup failed:", error.message);
  await closePool().catch(() => {});
  process.exit(1);
});
