import Fastify from "fastify";
import { getConfig } from "./config";
import { registerCors } from "./plugins/cors";
import { registerSession } from "./plugins/session";

export function buildApp() {
  const config = getConfig();
  const app = Fastify();

  registerCors(app, config.appOrigin);
  registerSession(app, config.sessionSecret);

  app.get("/health", async () => ({ ok: true }));

  return app;
}
