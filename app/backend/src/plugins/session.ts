import cookie from "@fastify/cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    sessionUserId: string | null;
  }
}

export function registerSession(app: FastifyInstance, secret: string) {
  app.register(cookie, { secret });

  app.addHook("onRequest", async (request) => {
    request.sessionUserId = request.cookies.session ?? null;
  });
}

export function setSession(reply: FastifyReply, userId: string) {
  reply.setCookie("session", userId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax"
  });
}

export function clearSession(reply: FastifyReply) {
  reply.clearCookie("session", { path: "/" });
}

export function requireSession(request: FastifyRequest) {
  if (!request.sessionUserId) {
    throw new Error("UNAUTHORIZED");
  }

  return request.sessionUserId;
}
