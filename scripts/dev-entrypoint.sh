#!/bin/sh
set -e

# Auto-install dependencies when lockfile changes
LOCKFILE_HASH_FILE="/home/node/app/node_modules/.lockfile-hash"
CURRENT_HASH=$(md5sum /home/node/app/pnpm-lock.yaml | cut -d' ' -f1)

if [ ! -f "$LOCKFILE_HASH_FILE" ] || [ "$(cat "$LOCKFILE_HASH_FILE")" != "$CURRENT_HASH" ]; then
  echo "[dev-entrypoint] Dependencies changed, running pnpm install..."
  pnpm install --frozen-lockfile
  echo "$CURRENT_HASH" > "$LOCKFILE_HASH_FILE"
else
  echo "[dev-entrypoint] Dependencies up to date."
fi

exec "$@"
