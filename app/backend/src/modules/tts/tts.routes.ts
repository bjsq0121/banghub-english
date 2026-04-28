import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getMissionTts, synthesize, TtsNotConfiguredError } from "./tts.service.js";

const querySchema = z.object({
  text: z.string().min(1).max(300).optional(),
  voice: z.string().min(1).max(80).optional(),
  language: z.string().min(2).max(20).optional(),
  missionId: z.string().min(1).max(160).optional(),
  childMode: z.string().min(1).max(20).optional()
});

export async function registerTtsRoutes(app: FastifyInstance) {
  app.get("/api/tts", async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);

    if (!parsed.success) {
      reply.code(400);
      return { message: "Invalid TTS query" };
    }

    if (parsed.data.text) {
      try {
        const audio = await synthesize(parsed.data.text, {
          voice: parsed.data.voice,
          language: parsed.data.language
        });
        reply.header("Content-Type", "audio/mpeg");
        reply.header("Cache-Control", "public, max-age=86400");
        return reply.send(audio);
      } catch (error) {
        if (error instanceof TtsNotConfiguredError) {
          reply.code(501);
          return { message: error.message };
        }

        request.log.error({ err: error }, "TTS synthesis failed");
        reply.code(502);
        return { message: "TTS upstream failed" };
      }
    }

    let result: Awaited<ReturnType<typeof getMissionTts>>;

    try {
      result = await getMissionTts(parsed.data.missionId, parsed.data.childMode);
    } catch (error) {
      if (error instanceof TtsNotConfiguredError) {
        reply.code(501);
        return { message: error.message };
      }

      request.log.error({ err: error }, "Mission TTS synthesis failed");
      reply.code(502);
      return { message: "TTS upstream failed" };
    }

    if (result.status === "invalid") {
      reply.code(400);
      return { message: "Invalid TTS request" };
    }

    if (result.status === "missing") {
      reply.code(404);
      return { message: "Mission not found" };
    }

    reply.header("Content-Type", result.contentType);
    reply.header("Cache-Control", "public, max-age=86400");
    return reply.send(result.body);
  });
}
