#!/usr/bin/env bash
set -euo pipefail

if ! command -v java >/dev/null 2>&1; then
  echo "Java is required to run Firestore-backed tests. Install a JRE/JDK and try again." >&2
  exit 1
fi

firebase emulators:exec --only firestore "pnpm test:packages"
