#!/usr/bin/env bash
set -euo pipefail

if ! command -v java >/dev/null 2>&1; then
  echo "Java is required to run the Firestore Emulator. Install a JRE/JDK and try again." >&2
  exit 1
fi

firebase emulators:start --only firestore
