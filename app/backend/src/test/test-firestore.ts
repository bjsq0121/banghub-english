import { afterEach, beforeEach } from "vitest";
import { getFirestoreClient } from "../db/firestore";

async function withTimeout<T>(promise: Promise<T>, ms: number) {
  return await Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Firestore Emulator is not reachable. Start it with `pnpm emulator:start` or run tests via `pnpm test`."));
      }, ms);
    })
  ]);
}

export async function clearFirestore() {
  const db = getFirestoreClient();
  const collections = await withTimeout(db.listCollections(), 1500);

  for (const collection of collections) {
    const snapshot = await collection.get();
    for (const doc of snapshot.docs) {
      await db.recursiveDelete(doc.ref);
    }
  }
}

beforeEach(async () => {
  await clearFirestore();
});

afterEach(async () => {
  await clearFirestore();
});
