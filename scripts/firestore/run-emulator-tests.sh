#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOCAL_JAVA_BIN="$REPO_ROOT/.tools/java/bin"
EMULATOR_DIR="$REPO_ROOT/.tools/firestore"
EMULATOR_LOG="$REPO_ROOT/firestore-emulator.log"

if [ -x "$LOCAL_JAVA_BIN/java" ]; then
  export PATH="$LOCAL_JAVA_BIN:$PATH"
fi

if ! command -v java >/dev/null 2>&1; then
  echo "Java is required to run Firestore-backed tests. Install a JRE/JDK and try again." >&2
  exit 1
fi

"$SCRIPT_DIR/start-emulator.sh" >"$EMULATOR_LOG" 2>&1 &
EMULATOR_PID=$!

cleanup() {
  if kill -0 "$EMULATOR_PID" >/dev/null 2>&1; then
    kill "$EMULATOR_PID" >/dev/null 2>&1 || true
    wait "$EMULATOR_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

for _ in $(seq 1 30); do
  if bash -lc "exec 3<>/dev/tcp/127.0.0.1/9080" >/dev/null 2>&1; then
    sleep 5
    pnpm test:packages
    exit 0
  fi
  sleep 1
done

echo "Firestore Emulator did not start within 30 seconds." >&2
echo "--- firestore-emulator.log ---" >&2
cat "$EMULATOR_LOG" >&2 || true
exit 1
