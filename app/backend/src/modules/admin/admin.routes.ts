import type { FastifyInstance } from "fastify";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";
import { requireSession } from "../../plugins/session";
import { saveContentItem } from "./admin.service";

export async function registerAdminRoutes(app: FastifyInstance) {
  app.post("/api/admin/content", async (request, reply) => {
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

    return { saved: await saveContentItem(request.body) };
  });
}
