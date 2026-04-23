import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

export function registerCors(app: FastifyInstance, origin: string) {
  app.register(cors, {
    origin,
    credentials: true
  });
}
