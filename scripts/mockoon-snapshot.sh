#!/bin/sh
# Periodically dump a Mockoon data bucket to $SNAPSHOT_DIR via the admin API.
# Run as the `mockoon-snapshot` sidecar in docker-compose.local.yml. See
# docs/mockoon-persistence.md.
#
# Dedup: skips writing when the bucket's .value is unchanged since the most
# recent snapshot (sha256 over `jq -cS .value`).
#
# Generational retention (each cycle, after the optional write):
#   - last 12h:   keep everything (every interval)
#   - 12h..24h:   keep one per UTC hour
#   - 24h..7d:    keep one per UTC day
#   - 7d..35d:    keep one per ISO week (epoch / 604800)
#   - >35d:       keep one per UTC month
# Within each bucket the NEWEST file is kept (so daily = end-of-day state).

set -eu

: "${MOCKOON_URL:=http://mockoon:3000}"
: "${SNAPSHOT_DIR:=/snapshots}"
: "${BUCKET_ID:=qres}"
: "${SNAPSHOT_INTERVAL_SECONDS:=300}"

hash_value() {
  jq -cS '.value' "$1" 2>/dev/null | sha256sum | cut -d' ' -f1
}

prune() {
  now=$(date -u +%s)
  cutoff_12h=$(( now - 12 * 3600 ))
  cutoff_24h=$(( now - 24 * 3600 ))
  cutoff_7d=$(( now - 7 * 86400 ))
  cutoff_35d=$(( now - 35 * 86400 ))

  all=$(mktemp)
  labeled=$(mktemp)
  keep=$(mktemp)

  find "$SNAPSHOT_DIR" -maxdepth 1 -type f -name "${BUCKET_ID}-*.json" > "$all"
  if [ ! -s "$all" ]; then
    rm -f "$all" "$labeled" "$keep"
    return 0
  fi

  while IFS= read -r f; do
    mt=$(date -u -r "$f" +%s)
    if [ "$mt" -ge "$cutoff_12h" ]; then
      bucket="0_recent"
    elif [ "$mt" -ge "$cutoff_24h" ]; then
      bucket="1_H_$(date -u -r "$f" +%Y%m%d%H)"
    elif [ "$mt" -ge "$cutoff_7d" ]; then
      bucket="2_D_$(date -u -r "$f" +%Y%m%d)"
    elif [ "$mt" -ge "$cutoff_35d" ]; then
      bucket="3_W_$(( mt / 604800 ))"
    else
      bucket="4_M_$(date -u -r "$f" +%Y%m)"
    fi
    printf '%s\t%s\t%s\n' "$bucket" "$mt" "$f"
  done < "$all" > "$labeled"

  # Sort by bucket asc, mt desc; within each non-"recent" bucket the first
  # row is the newest and the only one we keep.
  sort -t "$(printf '\t')" -k1,1 -k2,2nr "$labeled" | awk -F '\t' '
    {
      if ($1 == "0_recent") { print $3; next }
      if ($1 != prev) { print $3; prev = $1 }
    }
  ' > "$keep"

  deleted=0
  while IFS= read -r f; do
    if ! grep -qxF "$f" "$keep"; then
      rm -f "$f"
      deleted=$(( deleted + 1 ))
    fi
  done < "$all"
  if [ "$deleted" -gt 0 ]; then
    kept=$(wc -l < "$keep" | tr -d ' ')
    echo "mockoon-snapshot: pruned $deleted file(s), kept $kept"
  fi

  rm -f "$all" "$labeled" "$keep"
}

main() {
  apk add --no-cache curl jq >/dev/null
  echo "mockoon-snapshot: bucket='$BUCKET_ID' interval=${SNAPSHOT_INTERVAL_SECONDS}s dir=$SNAPSHOT_DIR"
  while true; do
    ts=$(date -u +%Y%m%dT%H%M%SZ)
    tmp=$(mktemp)
    if curl -fsS "${MOCKOON_URL}/mockoon-admin/data-buckets/${BUCKET_ID}" -o "$tmp"; then
      latest=$(find "$SNAPSHOT_DIR" -maxdepth 1 -type f -name "${BUCKET_ID}-*.json" | sort | tail -n 1)
      if [ -n "$latest" ] && [ "$(hash_value "$tmp")" = "$(hash_value "$latest")" ]; then
        echo "mockoon-snapshot: unchanged since $(basename "$latest"), skipping"
        rm -f "$tmp"
      else
        out="${SNAPSHOT_DIR}/${BUCKET_ID}-${ts}.json"
        mv "$tmp" "$out"
        echo "mockoon-snapshot: wrote $out"
      fi
    else
      echo "mockoon-snapshot: dump failed at $ts" >&2
      rm -f "$tmp"
    fi

    prune || echo "mockoon-snapshot: prune failed" >&2

    sleep "$SNAPSHOT_INTERVAL_SECONDS"
  done
}

# Skip the main loop when the script is being sourced as a library (e.g. from
# scripts/mockoon-snapshot.test.sh). The test harness sets MOCKOON_SNAPSHOT_LIB=1
# to get access to hash_value/prune without running the daemon.
if [ "${MOCKOON_SNAPSHOT_LIB:-0}" != "1" ]; then
  main "$@"
fi
