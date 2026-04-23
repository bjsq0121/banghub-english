import type { FastifyInstance } from "fastify";
import { markCompletionSchema } from "@banghub/shared";
import { requireSession } from "../../plugins/session";
import { markCompletion } from "./progress.service";

export async function registerProgressRoutes(app: FastifyInstance) {
  app.post("/api/progress/completions", async (request, reply) => {
    const userId = requireSession(request, reply);
    const payload = markCompletionSchema.parse(request.body);

    if (!userId) {
      return { message: "Unauthorized" };
    }

    markCompletion(userId, payload.contentId);
    return { ok: true };
  });
}
