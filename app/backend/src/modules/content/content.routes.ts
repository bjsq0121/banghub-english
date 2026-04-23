import type { FastifyInstance } from "fastify";
import { homeResponseSchema } from "@banghub/shared";
import { getTodayContent } from "./content.service";
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
}
