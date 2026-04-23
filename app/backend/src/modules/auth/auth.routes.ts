import type { FastifyInstance } from "fastify";
import { loginRequestSchema, updatePreferencesSchema } from "@banghub/shared";
import { clearSession, requireSession, setSession } from "../../plugins/session";
import { loginUser, updatePreferences } from "./auth.service";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const failedLoginAttempts = new Map<string, { count: number; firstAttemptAt: number }>();

function getLoginAttemptKey(email: string, ip: string) {
  return `${email.toLowerCase()}:${ip}`;
}

function getFailedLoginAttempt(key: string, now: number) {
  const attempt = failedLoginAttempts.get(key);

  if (!attempt || now - attempt.firstAttemptAt > LOGIN_ATTEMPT_WINDOW_MS) {
    return { count: 0, firstAttemptAt: now };
  }

  return attempt;
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const { email, password } = loginRequestSchema.parse(request.body);
    const now = Date.now();
    const attemptKey = getLoginAttemptKey(email, request.ip);
    const attempt = getFailedLoginAttempt(attemptKey, now);

    if (attempt.count >= MAX_FAILED_LOGIN_ATTEMPTS) {
      reply.code(429);
      return { message: "Too many login attempts" };
    }

    const user = await loginUser(email, password);

    if (!user) {
      failedLoginAttempts.set(attemptKey, {
        count: attempt.count + 1,
        firstAttemptAt: attempt.firstAttemptAt
      });
      reply.code(401);
      return { message: "Invalid credentials" };
    }

    failedLoginAttempts.delete(attemptKey);
    setSession(reply, user.id);
    return { user };
  });

  app.post("/api/auth/logout", async (_request, reply) => {
    clearSession(reply);
    return { ok: true };
  });

  app.post("/api/auth/preferences", async (request, reply) => {
    const userId = requireSession(request, reply);

    if (!userId) {
      return { message: "Unauthorized" };
    }

    const payload = updatePreferencesSchema.parse(request.body);
    await updatePreferences(userId, payload.difficulty, payload.selectedTracks);
    return { ok: true };
  });
}
