const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(`Backend server running at http://localhost:${env.port}`);
});
