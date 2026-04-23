import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";
import { requireSession } from "../../plugins/session";
import { saveDailyMission } from "./admin.service";

export async function registerAdminRoutes(app: FastifyInstance) {
  app.post("/api/admin/missions", async (request, reply) => {
    const userId = requireSession(request, reply);

    if (!userId) {
      return { message: "Unauthorized" };
    }

    const db = getFirestoreClient();
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
    const user = userDoc.data() as { isAdmin?: boolean } | undefined;

    if (!user?.isAdmin) {
      reply.code(403);
      return { message: "Forbidden" };
    }

    try {
      return { saved: await saveDailyMission(request.body) };
    } catch (error) {
      if (error instanceof ZodError) {
        reply.code(400);
        return { message: "Invalid mission payload" };
      }

      throw error;
    }
  });
}
