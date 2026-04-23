import type { FastifyInstance } from "fastify";
import { homeResponseSchema } from "@banghub/shared";
import { getContentById, getTodayContent } from "./content.service";
import { getViewerById } from "../auth/auth.service";
import { listCompletions } from "../progress/progress.service";

export async function registerContentRoutes(app: FastifyInstance) {
  app.get("/api/home", async (request) => {
    const viewer = request.sessionUserId ? getViewerById(request.sessionUserId) : null;
    const payload = {
      viewer,
      ...getTodayContent(),
      completions: request.sessionUserId ? listCompletions(request.sessionUserId) : []
    };

    return homeResponseSchema.parse(payload);
  });

  app.get("/api/content/:track/:id", async (request, reply) => {
    const params = request.params as { track: "conversation" | "news"; id: string };
    const item = getContentById(params.track, params.id);

    if (!item) {
      reply.code(404);
      return { message: "Not found" };
    }

    return { item };
  });
}
