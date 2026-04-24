import type { FastifyInstance } from "fastify";
import { homeResponseSchema, missionDetailResponseSchema } from "@banghub/shared";
import { getMissionById, getTodayMission } from "./content.service";
import { getViewerById } from "../auth/auth.service";
import { listCompletions } from "../progress/progress.service";

export async function registerContentRoutes(app: FastifyInstance) {
  app.get("/api/home", async (request) => {
    const viewer = request.sessionUserId ? await getViewerById(request.sessionUserId) : null;
    const todayMission = await getTodayMission();
    const completions = request.sessionUserId ? await listCompletions(request.sessionUserId) : [];

    return homeResponseSchema.parse({ viewer, todayMission, completions });
  });

  app.get("/api/missions/:id", async (request, reply) => {
    const params = request.params as { id: string };
    const item = await getMissionById(params.id);

    if (!item) {
      reply.code(404);
      return { message: "Not found" };
    }

    return missionDetailResponseSchema.parse({ item });
  });
}
