#!/usr/bin/env bash
set -euo pipefail

# Local pre-deploy verification. Run from repo root.
# Catches build breaks before touching Cloud Run / Firebase.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Typecheck all workspaces"
pnpm -r lint

echo "==> Build frontend (app/frontend/dist)"
pnpm --filter @banghub/frontend build

echo "==> Build backend (app/backend/dist)"
pnpm --filter @banghub/backend build

echo "==> Verify frontend dist has index.html"
test -f app/frontend/dist/index.html

echo "==> Verify backend dist has server entrypoint"
test -f app/backend/dist/backend/src/server.js

echo "==> Full test suite (Firestore emulator)"
pnpm test

if command -v docker >/dev/null 2>&1; then
  echo "==> Docker build (backend)"
  docker build -f app/backend/Dockerfile -t banghub-backend:local .
else
  echo "==> Docker not installed; skipping container build"
fi

echo ""
echo "Pre-deploy checks passed."
echo "Next:"
echo "  1. Confirm the external setup checklist in docs/DEPLOY.md is complete"
echo "     (GCP APIs, Firestore init, service accounts, Secret Manager, GCP_SA_KEY in GitHub)"
echo "  2. Push to main (GitHub Actions workflow .github/workflows/deploy.yml)"
echo "     or run the manual gcloud / firebase commands from DEPLOY.md"
