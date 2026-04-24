# Banghub English

Routine-first English study MVP with conversation and news tracks.

## Local Firestore

1. Copy `.env.example` to `.env`
2. Install Java, or place a local JRE at `.tools/java`
3. Start Firestore Emulator with `pnpm emulator:start` on `127.0.0.1:9080`
4. Seed local data with `pnpm --filter @banghub/backend seed`
5. Run the full test suite with `pnpm test`
