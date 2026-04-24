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
    const signedSession = request.cookies.session;

    if (!signedSession) {
      request.sessionUserId = null;
      return;
    }

    const unsigned = request.unsignCookie(signedSession);
    request.sessionUserId = unsigned.valid ? unsigned.value : null;
  });
}

export function setSession(reply: FastifyReply, userId: string) {
  reply.setCookie("session", userId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    signed: true
  });
}

export function clearSession(reply: FastifyReply) {
  reply.clearCookie("session", { path: "/" });
}

export function requireSession(request: FastifyRequest, reply: FastifyReply) {
  if (!request.sessionUserId) {
    reply.code(401);
    return null;
  }

  return request.sessionUserId;
}
