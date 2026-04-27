import Fastify from "fastify";
import { getConfig } from "./config.js";
import { registerAdminRoutes } from "./modules/admin/admin.routes.js";
import { registerAuthRoutes } from "./modules/auth/auth.routes.js";
import { registerContentRoutes } from "./modules/content/content.routes.js";
import { registerProgressRoutes } from "./modules/progress/progress.routes.js";
import { registerTtsRoutes } from "./modules/tts/tts.routes.js";
import { registerCors } from "./plugins/cors.js";
import { registerSession } from "./plugins/session.js";

export function buildApp() {
  const config = getConfig();
  const app = Fastify();

  registerCors(app, config.appOrigin);
  registerSession(app, config.sessionSecret);

  app.get("/health", async () => ({ ok: true }));
  void registerAdminRoutes(app);
  void registerAuthRoutes(app);
  void registerContentRoutes(app);
  void registerProgressRoutes(app);
  void registerTtsRoutes(app);

  return app;
}
