import Fastify from "fastify";
import { getConfig } from "./config";
import { registerAdminRoutes } from "./modules/admin/admin.routes";
import { registerAuthRoutes } from "./modules/auth/auth.routes";
import { registerContentRoutes } from "./modules/content/content.routes";
import { registerProgressRoutes } from "./modules/progress/progress.routes";
import { registerCors } from "./plugins/cors";
import { registerSession } from "./plugins/session";

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

  return app;
}
