import type { FastifyInstance } from "fastify";
import { markCompletionSchema } from "@banghub/shared";
import { requireSession } from "../../plugins/session.js";
import { markCompletion } from "./progress.service.js";

export async function registerProgressRoutes(app: FastifyInstance) {
  app.post("/api/progress/completions", async (request, reply) => {
    const userId = requireSession(request, reply);

    if (!userId) {
      return { message: "Unauthorized" };
    }

    const payload = markCompletionSchema.parse(request.body);
    await markCompletion(userId, payload.missionId, payload.childMode);
    return { ok: true };
  });
}
