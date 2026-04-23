export function getConfig() {
  return {
    port: Number(process.env.PORT ?? 4000),
    appOrigin: process.env.APP_ORIGIN ?? "http://localhost:5173",
    sessionSecret: process.env.SESSION_SECRET ?? "change-me",
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@banghub.kr",
    adminPassword: process.env.ADMIN_PASSWORD ?? "change-me",
    firestoreProjectId: process.env.FIRESTORE_PROJECT_ID ?? "banghub-english-local",
    firestoreEmulatorHost: process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:9080",
    useFirestoreEmulator: process.env.USE_FIRESTORE_EMULATOR !== "false"
  };
}
