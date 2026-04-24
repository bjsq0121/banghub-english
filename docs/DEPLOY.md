# Deploy

Banghub English runs on Google Cloud + Firebase. Single user-facing origin
via Firebase Hosting; the Fastify backend lives on Cloud Run and is reached
through Hosting rewrites so cookies stay same-origin and no CORS is needed.

## Architecture

```
Browser ── https://<hosting-domain>
             │
             ├── /            ─── Firebase Hosting (app/frontend/dist SPA)
             ├── /assets/*    ─── Firebase Hosting (cached 1y)
             └── /api/**      ─── Hosting rewrite → Cloud Run (banghub-backend)
                                    │
                                    ├── Firestore (native, same GCP project)
                                    └── Cloud Text-to-Speech

```

- Frontend: Firebase Hosting, built with `pnpm --filter @banghub/frontend build`.
- Backend: Cloud Run service `banghub-backend`, region `asia-northeast3`
  (Seoul — change in `firebase.json` + `gcloud run deploy --region` if moving).
  Source of truth for the container: `app/backend/Dockerfile`.
- Data: production Firestore in the same GCP project. Client writes are
  denied by `infra/firestore.rules`; the backend uses firebase-admin which
  bypasses rules.
- Auth: signed session cookies set by Fastify, same-origin so the browser
  ships them on the rewrite to Cloud Run automatically.
- TTS: Cloud Text-to-Speech API. Service account attached to Cloud Run
  needs `roles/cloudtts.user`.

## One-time external setup checklist

Items a human must do in a GCP/Firebase console or CLI. Nothing in the
repo finishes the deploy alone.

### GCP project
- [ ] Create (or pick) a GCP project. Note its **project id** (not number).
- [ ] Enable APIs:
  - Firestore API (`firestore.googleapis.com`)
  - Cloud Run Admin API (`run.googleapis.com`)
  - Cloud Build API (`cloudbuild.googleapis.com`)
  - Artifact Registry API (`artifactregistry.googleapis.com`)
  - Cloud Text-to-Speech API (`texttospeech.googleapis.com`)
  - Secret Manager API (`secretmanager.googleapis.com`)
- [ ] Initialize Firestore in **Native mode** (one-time, irreversible; pick a region).
- [ ] Create an Artifact Registry repo for the backend image, e.g.
      `asia-northeast3-docker.pkg.dev/<project>/banghub`.

### Firebase
- [ ] Link the Firebase project to the same GCP project.
- [ ] Note the Hosting site id (default matches project id → `*.web.app`).
- [ ] If using a custom domain: add it in Firebase Hosting → Custom Domains,
      complete the TXT + A record verification, wait for cert provisioning.

### Service account for Cloud Run
The default Compute Engine SA works for a first deploy, but creating a
dedicated one is cleaner.
- [ ] Create SA `banghub-backend@<project>.iam.gserviceaccount.com`.
- [ ] Grant roles:
  - `roles/datastore.user` (Firestore read/write)
  - `roles/cloudtts.user` (Text-to-Speech)
  - `roles/secretmanager.secretAccessor` (pulls secrets as env)
- [ ] Attach to the Cloud Run service at deploy time (`--service-account`).

### Secrets (Secret Manager)
Create these secrets; reference by name in `gcloud run deploy
--set-secrets`:
- [ ] `SESSION_SECRET` — strong random (32+ bytes, `openssl rand -base64 48`)
- [ ] `ADMIN_PASSWORD` — admin login password

### Local config pointers
- [ ] `.firebaserc` → replace `REPLACE_WITH_GCP_PROJECT_ID` with the real id.
- [ ] Choose a Cloud Run region if not `asia-northeast3`; update
      `firebase.json` rewrite `region` and the deploy command.

## Pre-deploy verification

Run on every deploy, locally:

```
./scripts/deploy-check.sh
```

What it does: workspace typecheck → build frontend+backend dists → full
`pnpm test` (Firestore emulator) → if Docker is installed, container build
of the backend image.

## Deploy runbook

After the checklist is done and `./scripts/deploy-check.sh` is green:

### 1. Backend → Cloud Run
```
gcloud run deploy banghub-backend \
  --source . \
  --source-ignore-file .dockerignore \
  --dockerfile app/backend/Dockerfile \
  --region asia-northeast3 \
  --project <PROJECT_ID> \
  --service-account banghub-backend@<PROJECT_ID>.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars \
    NODE_ENV=production,\
    APP_ORIGIN=https://<hosting-domain>,\
    ADMIN_EMAIL=admin@banghub.kr,\
    FIRESTORE_PROJECT_ID=<PROJECT_ID>,\
    USE_FIRESTORE_EMULATOR=false,\
    GOOGLE_TTS_ENABLED=true,\
    GOOGLE_TTS_VOICE=en-US-Neural2-F,\
    GOOGLE_TTS_LANGUAGE=en-US \
  --set-secrets \
    SESSION_SECRET=SESSION_SECRET:latest,\
    ADMIN_PASSWORD=ADMIN_PASSWORD:latest
```

`--allow-unauthenticated` is intentional: the service is reached via
Firebase Hosting rewrite (which proxies as an authenticated service agent)
**and** by direct browser preflight during development. The Fastify layer
is the auth boundary.

### 2. Firestore rules + frontend → Firebase
```
firebase use production
firebase deploy --only firestore:rules,hosting
```

Hosting deploy picks up `app/frontend/dist` which `deploy-check.sh`
already built. If you skipped that, run
`pnpm --filter @banghub/frontend build` first.

### 3. Smoke test
- [ ] `curl https://<hosting-domain>/api/home` returns JSON.
- [ ] Visit the site, log in as admin, create a mission.
- [ ] Play a mission; the listen button should fetch Cloud TTS (watch
      Network tab for `/api/tts`, should return `audio/mpeg`).

## Env vars reference

| Var | Where | Purpose |
| --- | --- | --- |
| `NODE_ENV=production` | Cloud Run env | Toggles secure cookie |
| `PORT=8080` | Cloud Run (default) | Fastify listen port |
| `APP_ORIGIN` | Cloud Run env | CORS allowlist (rarely used same-origin) |
| `SESSION_SECRET` | Cloud Run secret | Signs session cookie |
| `ADMIN_EMAIL` | Cloud Run env | Seeded admin login |
| `ADMIN_PASSWORD` | Cloud Run secret | Seeded admin password |
| `FIRESTORE_PROJECT_ID` | Cloud Run env | Prod Firestore project |
| `USE_FIRESTORE_EMULATOR=false` | Cloud Run env | Opt out of emulator |
| `GOOGLE_TTS_ENABLED=true` | Cloud Run env | Turn on `/api/tts` provider |
| `GOOGLE_TTS_VOICE` | Cloud Run env | Neural voice id |
| `GOOGLE_TTS_LANGUAGE` | Cloud Run env | BCP-47 language |
| `VITE_API_BASE_URL=` | Frontend build (`.env.production`) | Empty → same-origin |

## Rollback

- Backend: `gcloud run services update-traffic banghub-backend
  --to-revisions=<PREVIOUS_REVISION>=100 --region asia-northeast3`
- Frontend: `firebase hosting:clone <site>:live <site>:rollback` then
  flip traffic, or redeploy the previous git tag.

## Not yet automated

- GitHub Actions CI/CD pipeline (everything above is manual today).
- First-run Firestore seed for prod (run `pnpm --filter @banghub/backend seed`
  once with `USE_FIRESTORE_EMULATOR=false` and
  `GOOGLE_APPLICATION_CREDENTIALS` pointing at the service account key;
  do this from a trusted workstation, not Cloud Run).
- Alerting + uptime checks.
