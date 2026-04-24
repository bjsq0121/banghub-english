import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { TtsNotConfiguredError, synthesize } from "./tts.service";

const querySchema = z.object({
  text: z.string().min(1).max(300),
  voice: z.string().min(1).max(80).optional(),
  language: z.string().min(2).max(20).optional()
});

export async function registerTtsRoutes(app: FastifyInstance) {
  app.get("/api/tts", async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);

    if (!parsed.success) {
      reply.code(400);
      return { message: "Invalid TTS query" };
    }

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
  });
}
