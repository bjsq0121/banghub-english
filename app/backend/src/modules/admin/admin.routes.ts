import type { FastifyInstance } from "fastify";
import { db } from "../../db/client";
import { requireSession } from "../../plugins/session";
import { saveContentItem } from "./admin.service";

export async function registerAdminRoutes(app: FastifyInstance) {
  app.post("/api/admin/content", async (request, reply) => {
    const userId = requireSession(request, reply);

    if (!userId) {
      return { message: "Unauthorized" };
    }

    const user = db.read().users.find((entry) => entry.id === userId);

    if (!user?.is_admin) {
      reply.code(403);
      return { message: "Forbidden" };
    }

    return { saved: saveContentItem(request.body) };
  });
}
