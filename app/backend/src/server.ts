import { buildApp } from "./app";
import { getConfig } from "./config";

const config = getConfig();
const app = buildApp();

app.listen({ port: config.port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
