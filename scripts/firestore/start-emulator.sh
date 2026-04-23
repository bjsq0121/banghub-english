#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOCAL_JAVA_BIN="$REPO_ROOT/.tools/java/bin"
EMULATOR_DIR="$REPO_ROOT/.tools/firestore"
EMULATOR_VERSION="1.19.8"
EMULATOR_JAR="$EMULATOR_DIR/cloud-firestore-emulator-v${EMULATOR_VERSION}.jar"
EMULATOR_URL="https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-firestore-emulator-v${EMULATOR_VERSION}.jar"

find_open_port() {
  local start="$1"
  local end="$2"

  for port in $(seq "$start" "$end"); do
    if ! ss -ltn | awk '{print $4}' | grep -qE "(^|:)$port$"; then
      echo "$port"
      return 0
    fi
  done

  echo "Unable to find an open port in range ${start}-${end}." >&2
  exit 1
}

if [ -x "$LOCAL_JAVA_BIN/java" ]; then
  export PATH="$LOCAL_JAVA_BIN:$PATH"
fi

if ! command -v java >/dev/null 2>&1; then
  echo "Java is required to run the Firestore Emulator. Install a JRE/JDK and try again." >&2
  exit 1
fi

mkdir -p "$EMULATOR_DIR"

if [ ! -f "$EMULATOR_JAR" ]; then
  curl -L "$EMULATOR_URL" -o "$EMULATOR_JAR"
fi

WEBCHANNEL_PORT="${FIRESTORE_WEBCHANNEL_PORT:-$(find_open_port 19081 19149)}"
WEBSOCKET_PORT="${FIRESTORE_WEBSOCKET_PORT:-$(find_open_port 19150 19249)}"

exec java \
  -Djava.net.preferIPv4Stack=true \
  -Dgoogle.cloud_firestore.debug_log_level=FINE \
  -Duser.language=en \
  -jar "$EMULATOR_JAR" \
  --host 127.0.0.1 \
  --port 9080 \
  --webchannel_port "$WEBCHANNEL_PORT" \
  --websocket_port "$WEBSOCKET_PORT" \
  --rules "$REPO_ROOT/infra/firestore.rules" \
  --project_id banghub-english-local \
  --single_project_mode true
