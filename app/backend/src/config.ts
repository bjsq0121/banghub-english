export function getConfig() {
  const sessionSecret = process.env.SESSION_SECRET ?? "change-me";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me";

  if (process.env.NODE_ENV === "production") {
    if (sessionSecret === "change-me") {
      throw new Error("SESSION_SECRET must be set in production");
    }

    if (adminPassword === "change-me") {
      throw new Error("ADMIN_PASSWORD must be set in production");
    }
  }

  return {
    port: Number(process.env.PORT ?? 4000),
    appOrigin: process.env.APP_ORIGIN ?? "http://localhost:5173",
    sessionSecret,
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@banghub.kr",
    adminPassword,
    firestoreProjectId: process.env.FIRESTORE_PROJECT_ID ?? "banghub-english-local",
    firestoreEmulatorHost: process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:9080",
    useFirestoreEmulator: process.env.USE_FIRESTORE_EMULATOR !== "false",
    storageBucket: process.env.STORAGE_BUCKET ?? "",
    googleTtsEnabled: process.env.GOOGLE_TTS_ENABLED === "true",
    googleTtsVoice: process.env.GOOGLE_TTS_VOICE ?? "en-US-Neural2-F",
    googleTtsLanguage: process.env.GOOGLE_TTS_LANGUAGE ?? "en-US"
  };
}
