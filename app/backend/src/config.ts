export function getConfig() {
  return {
    port: Number(process.env.PORT ?? 4000),
    appOrigin: process.env.APP_ORIGIN ?? "http://localhost:5173",
    sqlitePath: process.env.SQLITE_PATH ?? "./data/dev.sqlite",
    sessionSecret: process.env.SESSION_SECRET ?? "change-me",
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@banghub.kr",
    adminPassword: process.env.ADMIN_PASSWORD ?? "change-me"
  };
}
