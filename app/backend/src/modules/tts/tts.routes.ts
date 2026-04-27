import type { FastifyInstance } from "fastify";
import { getMissionTts } from "./tts.service";

export async function registerTtsRoutes(app: FastifyInstance) {
  app.get("/api/tts", async (request, reply) => {
    const query = request.query as { missionId?: string; childMode?: string };
    const result = await getMissionTts(query.missionId, query.childMode);

    if (result.status === "invalid") {
      reply.code(400);
      return { message: "Invalid TTS request" };
    }

    if (result.status === "missing") {
      reply.code(404);
      return { message: "Mission not found" };
    }

    reply.type(result.contentType);
    return reply.send(result.body);
  });
}
