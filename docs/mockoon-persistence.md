# Hacked Mockoon Persistence

The Mockoon CLI exposes an admin API by default at /mockoon-admin/\* on the same port. Use it to
dump bucket state on demand. With your port mapping 3001:3000, from the host:

```bash
# read the whole qres bucket as JSON (current in-memory state)
curl -s http://localhost:3001/mockoon-admin/data-buckets/qres | jq .value > qres-dump.json

# list everything
curl -s http://localhost:3001/mockoon-admin/data-buckets | jq
```

## Three pragmatic patterns layered on top

1. Manual export when you need it. Just run the curl above. Good for ad-hoc inspection / handing
   data to the customer's analytics person.
2. Periodic snapshot to a writable host volume. Add a tiny sidecar to the compose file:

```yaml
mockoon-snapshot:
  container_name: inkapp-mockoon-snapshot-local
  image: alpine:3
  depends_on:
    mockoon:
      condition: service_healthy
  volumes:
    - ./mockoon-snapshots:/snapshots
  environment:
    SNAPSHOT_INTERVAL_SECONDS: "300"
    BUCKET_ID: "qres"
  entrypoint:
    - sh
    - -c
    - |
      set -eu
      apk add --no-cache curl >/dev/null
      echo "mockoon-snapshot: dumping bucket '$$BUCKET_ID' every $${SNAPSHOT_INTERVAL_SECONDS}s to /snapshots"
      while true; do
        ts=$$(date -u +%Y%m%dT%H%M%SZ)
        out="/snapshots/$${BUCKET_ID}-$${ts}.json"
        if curl -fsS "http://mockoon:3000/mockoon-admin/data-buckets/$${BUCKET_ID}" -o "$$out"; then
          echo "mockoon-snapshot: wrote $$out"
        else
          echo "mockoon-snapshot: dump failed at $$ts" >&2
        fi
        sleep "$$SNAPSHOT_INTERVAL_SECONDS"
      done
  restart: unless-stopped
```

2. Snapshots land in `./mockoon-snapshots/` on the host every 5 min. Survives container restarts
   because they're on the host filesystem.
3. **Reseed on startup from the latest snapshot.** Real persistence loop. Before `mockoon` starts,
   run a small init container that reads the newest snapshot, splices it into a copy of
   `mockoon.json`'s `data[*].value` field for `qres`, and writes the result to a `:rw` mount Mockoon
   then loads from. Not included here.
