# Deploy

Production runs on **Google Cloud project `banghub-english-prod`**, region
**`asia-northeast3` (Seoul)**, with Firebase Hosting in front of Cloud Run
so everything shares one origin.

## Architecture

```
Browser ── https://english.banghub.kr (or banghub-english-prod.web.app fallback)
             │
             ├── /            ─── Firebase Hosting (app/frontend/dist SPA)
             ├── /assets/*    ─── Firebase Hosting (1y immutable cache)
             └── /api/**      ─── Hosting rewrite → Cloud Run banghub-backend
                                    │
                                    ├── Firestore (native mode, same GCP project)
                                    └── Cloud Text-to-Speech
```

- **Custom domain**: `english.banghub.kr` (primary, once DNS is live).
  `banghub-english-prod.web.app` stays as the always-available Firebase
  fallback.
- **Region**: `asia-northeast3`. Firestore init is irreversible — confirm
  before creating.
- **Backend**: Cloud Run service `banghub-backend`. The container comes
  from `app/backend/Dockerfile`.
- **Image build path**: GitHub Actions submits `cloudbuild.yaml`, which
  builds `app/backend/Dockerfile` with repo-root context and pushes the
  image to Artifact Registry before Cloud Run deploys it.
- **GitHub deploy auth**: GitHub Actions uses Workload Identity
  Federation against the deploy SA. Long-lived JSON keys are blocked by
  org policy and are not used.
- **Secrets**: `SESSION_SECRET`, `ADMIN_PASSWORD` in Secret Manager. Never
  in the repo. Code keeps `.env.example` placeholders only.
- **Firestore rules**: default-deny. The backend uses firebase-admin which
  bypasses rules; no direct client access is expected.

---

## External setup checklist (human-required)

Things the repo can't do on its own. Walk these top-to-bottom the first
time; afterwards, only DNS changes or secret rotations need revisiting.

### GCP project & APIs
- [ ] Create project `banghub-english-prod` (GCP Console → New Project).
- [ ] In that project, enable the APIs:
  ```
  gcloud services enable \
    firestore.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    firebase.googleapis.com \
    texttospeech.googleapis.com \
    secretmanager.googleapis.com \
    --project banghub-english-prod
  ```
- [ ] Initialize Firestore in **Native mode**, region
      `asia-northeast3` (Firebase Console → Firestore Database → Create
      database). This is irreversible; confirm region first.
- [ ] Create an Artifact Registry repo for container images:
  ```
  gcloud artifacts repositories create banghub \
    --repository-format=docker \
    --location=asia-northeast3 \
    --project banghub-english-prod
  ```

### Firebase project
- [ ] In Firebase Console, **Add project → select existing GCP project
      `banghub-english-prod`**. This links Firebase to the same project.
- [ ] Confirm the default Hosting site id (matches project id →
      `banghub-english-prod.web.app`).

### Service accounts
- [ ] Create the Cloud Run runtime SA (least privilege for the running
      container):
  ```
  gcloud iam service-accounts create banghub-backend \
    --display-name="Banghub Cloud Run runtime" \
    --project banghub-english-prod
  ```
- [ ] Grant it runtime roles:
  ```
  SA="banghub-backend@banghub-english-prod.iam.gserviceaccount.com"
  for role in \
      roles/datastore.user \
      roles/secretmanager.secretAccessor
  do
    gcloud projects add-iam-policy-binding banghub-english-prod \
      --member="serviceAccount:$SA" --role="$role"
  done
  ```
  `roles/cloudtts.user` is not a real predefined role. Cloud TTS access
  stays out of the bootstrap checklist unless a verified minimal role is
  identified later.
- [ ] Create the deploy SA (used by GitHub Actions to push builds):
  ```
  gcloud iam service-accounts create banghub-deployer \
    --display-name="Banghub CI/CD deployer" \
    --project banghub-english-prod
  ```
- [ ] Grant deploy roles:
  ```
  DEPLOY_SA="banghub-deployer@banghub-english-prod.iam.gserviceaccount.com"
  for role in \
      roles/run.admin \
      roles/iam.serviceAccountUser \
      roles/cloudbuild.builds.editor \
      roles/artifactregistry.writer \
      roles/storage.admin \
      roles/firebasehosting.admin \
      roles/firebaserules.admin \
      roles/datastore.user \
      roles/serviceusage.serviceUsageConsumer
  do
    gcloud projects add-iam-policy-binding banghub-english-prod \
      --member="serviceAccount:$DEPLOY_SA" --role="$role"
  done
  ```
- [ ] Create a GitHub Workload Identity Pool and provider:
  ```
  gcloud iam workload-identity-pools create github \
    --project=banghub-english-prod \
    --location=global \
    --display-name="GitHub Actions Pool"

  gcloud iam workload-identity-pools providers create-oidc banghub-english \
    --project=banghub-english-prod \
    --location=global \
    --workload-identity-pool=github \
    --display-name="Banghub English GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.ref=assertion.ref,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition='assertion.repository == "bjsq0121/banghub-english" && assertion.ref == "refs/heads/main"' \
    --issuer-uri="https://token.actions.githubusercontent.com"
  ```
- [ ] Allow the GitHub repo to impersonate the deploy SA:
  ```
  gcloud iam service-accounts add-iam-policy-binding \
    banghub-deployer@banghub-english-prod.iam.gserviceaccount.com \
    --project=banghub-english-prod \
    --role=roles/iam.workloadIdentityUser \
    --member="principalSet://iam.googleapis.com/projects/299811757155/locations/global/workloadIdentityPools/github/attribute.repository/bjsq0121/banghub-english"
  ```

### Secrets
- [ ] Generate a session secret (store the output; you'll need it once):
  ```
  openssl rand -base64 48
  ```
- [ ] Generate the admin password:
  ```
  openssl rand -base64 24
  ```
- [ ] Create secrets in Secret Manager (paste each value at the prompt):
  ```
  printf "%s" "<paste-session-secret>" | \
    gcloud secrets create SESSION_SECRET \
      --data-file=- --project banghub-english-prod
  printf "%s" "<paste-admin-password>" | \
    gcloud secrets create ADMIN_PASSWORD \
      --data-file=- --project banghub-english-prod
  ```
- [ ] Save the admin password in your password manager. There is no
      recovery flow — you'll need it to log in as admin the first time.

### Custom domain & DNS

**TODO — DNS provider not yet chosen.** Fill in once decided
(Cloudflare / Route 53 / Google Domains / other). High-level flow:

- [ ] In Firebase Console → Hosting → Add custom domain → enter
      `english.banghub.kr`.
- [ ] Firebase will issue a TXT challenge. Add it at the DNS provider.
- [ ] After verification, Firebase will give A/AAAA (or ALIAS/CNAME)
      records. Add them.
- [ ] Wait for the managed certificate to provision (can take up to 24
      hours).
- [ ] Until the custom domain is live, use
      `https://banghub-english-prod.web.app` — the code treats it as a
      fallback; no config change needed.

### GitHub Actions repo settings (one-time)

For `.github/workflows/deploy.yml` to work:

- [ ] No `GCP_SA_KEY` secret is needed. The workflow authenticates with
      GitHub OIDC + Workload Identity Federation.
- [ ] (Optional) Protect the `main` branch with "Require status checks
      to pass" so the deploy workflow must succeed before a merge is
      possible via PR.

---

## Pre-deploy verification (local)

```
./scripts/deploy-check.sh
# or:
pnpm deploy:check
```

What it does: workspace typecheck → build frontend + backend dists →
full `pnpm test` (Firestore emulator) → Docker build of the backend
image if Docker is installed. All green means the branch is deployable.

---

## Deploy runbook

### Option A — GitHub Actions (recommended)

Once Workload Identity Federation is configured, every push to `main` triggers
`.github/workflows/deploy.yml`: test → deploy backend → deploy frontend.
Frontend waits for the Cloud Run service so the very first production deploy
does not race the Hosting rewrite against a missing backend. Manual re-run:
Actions tab → Deploy → Run workflow.

### Option B — Manual from a dev machine

Only use when CI is blocked. Requires `gcloud auth login` and
`firebase login` as a human with owner-level access.

**Backend image → Artifact Registry via Cloud Build**
```
SHORT_SHA="$(git rev-parse --short HEAD)"
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions "_IMAGE_TAG=${SHORT_SHA}" \
  --project banghub-english-prod \
  .
```

**Backend → Cloud Run**
```
SHORT_SHA="$(git rev-parse --short HEAD)"
gcloud run deploy banghub-backend \
  --image "asia-northeast3-docker.pkg.dev/banghub-english-prod/banghub/backend:${SHORT_SHA}" \
  --region asia-northeast3 \
  --project banghub-english-prod \
  --service-account banghub-backend@banghub-english-prod.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,APP_ORIGIN=https://english.banghub.kr,ADMIN_EMAIL=admin@banghub.kr,FIRESTORE_PROJECT_ID=banghub-english-prod,USE_FIRESTORE_EMULATOR=false,GOOGLE_TTS_ENABLED=true,GOOGLE_TTS_VOICE=en-US-Neural2-F,GOOGLE_TTS_LANGUAGE=en-US" \
  --set-secrets "SESSION_SECRET=SESSION_SECRET:latest,ADMIN_PASSWORD=ADMIN_PASSWORD:latest"
```

`--allow-unauthenticated` is intentional: Fastify is the auth layer;
Firebase Hosting talks to Cloud Run as a service agent on your behalf.

**Frontend + Firestore rules → Firebase**
```
pnpm --filter @banghub/frontend build
firebase use production
firebase deploy --only hosting,firestore:rules
```

### First-run admin seed

The backend only creates the admin user when the seed script runs.
After the first Cloud Run deploy, seed Firestore once from a trusted
workstation that has user ADC configured:

Prerequisite: your Google account needs Firestore write access.
`roles/datastore.user` is sufficient; Owner/Editor already includes it.

```
gcloud auth application-default login
gcloud auth application-default set-quota-project banghub-english-prod
```

Then run:

```
USE_FIRESTORE_EMULATOR=false \
FIRESTORE_PROJECT_ID=banghub-english-prod \
ADMIN_EMAIL=admin@banghub.kr \
ADMIN_PASSWORD="<paste-admin-password>" \
pnpm --filter @banghub/backend seed
```

Run from a trusted workstation, not Cloud Run. No JSON key file is
required or expected.

If the TTS smoke test fails with 401/403, grant the runtime service
account `roles/serviceusage.serviceUsageConsumer` and re-run the check:

```
gcloud projects add-iam-policy-binding banghub-english-prod \
  --member="serviceAccount:banghub-backend@banghub-english-prod.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageConsumer"
```

### Smoke test

- [ ] `curl https://english.banghub.kr/api/home` (or the `.web.app`
      fallback if DNS is not live) returns JSON with `viewer: null` and
      a `todayMission` object.
- [ ] Log in as `admin@banghub.kr` in the UI.
- [ ] Open a mission, press Listen — Network tab shows `/api/tts?text=…`
      returning `audio/mpeg`.

---

## Env vars reference

| Var | Where | Purpose |
| --- | --- | --- |
| `NODE_ENV=production` | Cloud Run env | Enables secure cookie flag |
| `PORT=8080` | Cloud Run (default) | Fastify listen port |
| `APP_ORIGIN=https://english.banghub.kr` | Cloud Run env | CORS allowlist (unused at runtime thanks to same-origin rewrite, but registered for defense in depth) |
| `ADMIN_EMAIL=admin@banghub.kr` | Cloud Run env | Seeded admin login |
| `ADMIN_PASSWORD` | Cloud Run secret (`ADMIN_PASSWORD:latest`) | Admin password hash input |
| `SESSION_SECRET` | Cloud Run secret (`SESSION_SECRET:latest`) | Signs session cookie |
| `FIRESTORE_PROJECT_ID=banghub-english-prod` | Cloud Run env | Prod Firestore project |
| `USE_FIRESTORE_EMULATOR=false` | Cloud Run env | Opt out of emulator path |
| `GOOGLE_TTS_ENABLED=true` | Cloud Run env | Turns on `/api/tts` provider |
| `GOOGLE_TTS_VOICE=en-US-Neural2-F` | Cloud Run env | Neural voice id |
| `GOOGLE_TTS_LANGUAGE=en-US` | Cloud Run env | BCP-47 language |
| `VITE_API_BASE_URL=""` | Frontend build (`.env.production`) | Empty → same-origin via Hosting rewrite |

---

## Rollback

- **Backend**: roll traffic to the previous Cloud Run revision:
  ```
  gcloud run revisions list --service banghub-backend \
    --region asia-northeast3 --project banghub-english-prod
  gcloud run services update-traffic banghub-backend \
    --to-revisions=<PREVIOUS_REVISION>=100 \
    --region asia-northeast3 --project banghub-english-prod
  ```
- **Frontend**: Firebase Console → Hosting → Release history → Rollback,
  or re-deploy a previous git tag.

---

## Hardening (do after first green deploy)

- [ ] Set up Cloud Monitoring uptime checks on `/api/home`.
- [ ] Set up Cloud Logging alerts for 5xx spikes and TTS quota errors.
- [ ] Periodically rotate `SESSION_SECRET` (session invalidation expected).
- [ ] Review admin password rotation cadence.

---

## Not in scope yet

- Per-PR preview environments.
- Automated first-run seed (currently a manual step).
- Cost caps / budget alerts (set once real traffic starts).
