import type { FastifyInstance } from "fastify";
import { loginRequestSchema, updatePreferencesSchema } from "@banghub/shared";
import { clearSession, requireSession, setSession } from "../../plugins/session";
import { loginUser, updatePreferences } from "./auth.service";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const { email, password } = loginRequestSchema.parse(request.body);
    const user = loginUser(email, password);

    if (!user) {
      reply.code(401);
      return { message: "Invalid credentials" };
    }

    setSession(reply, user.id);
    return { user };
  });

  app.post("/api/auth/logout", async (_request, reply) => {
    clearSession(reply);
    return { ok: true };
  });

  app.post("/api/auth/preferences", async (request, reply) => {
    const userId = requireSession(request, reply);
    const payload = updatePreferencesSchema.parse(request.body);

    if (!userId) {
      return { message: "Unauthorized" };
    }

    updatePreferences(userId, payload.difficulty, payload.selectedTracks);
    return { ok: true };
  });
}
