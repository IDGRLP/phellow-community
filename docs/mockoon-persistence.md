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
2. **Periodic snapshot to a writable host volume**, implemented as the `mockoon-snapshot` sidecar in
   `docker-compose.local.yml`. Every `SNAPSHOT_INTERVAL_SECONDS` (default 300) it dumps the bucket
   via the admin API to `./mockoon-snapshots/qres-YYYYMMDDTHHMMSSZ.json` on the host. Loop logic
   lives in `scripts/mockoon-snapshot.sh`.

   **Dedup:** before writing, the new dump's `.value` is normalized via `jq -cS` and sha256'd
   against the most recent existing snapshot. If they match, the new file is discarded — so long
   idle periods don't accumulate identical copies.

   **Generational retention** (applied after every cycle, by file mtime; within each bucket the
   newest file survives):

   | Age range | Resolution kept                   |
   | --------: | :-------------------------------- |
   |    < 12 h | every snapshot                    |
   |   12–24 h | one per UTC hour                  |
   |  24 h–7 d | one per UTC day                   |
   |    7–35 d | one per ISO week (epoch / 604800) |
   |    > 35 d | one per UTC month                 |

   So the directory size is bounded roughly by ~144 (last 12 h at 5-min cadence, minus whatever
   dedup skipped) + 12 hourly + 6 daily + 4 weekly + N monthly.

3. **Reseed on startup from the latest snapshot.** Real persistence loop, implemented as the
   `mockoon-seed` one-shot service in `docker-compose.local.yml`. Before `mockoon` starts, it:
   1. Picks the newest `qres-*.json` from `./mockoon-snapshots/` (falls back to the seed value in
      `samples/mockoon.json` on first run, when no snapshot exists).
   2. Splices the snapshot's `.value` array into a copy of `samples/mockoon.json` at
      `data[id=qres].value` via `jq` — note that Mockoon stores bucket values as JSON-encoded
      strings, so the array is `tojson`'d before injection.
   3. Writes the rewritten config to the `mockoon_runtime` named volume, which `mockoon` mounts
      read-only at `/data`.

   `mockoon` declares `depends_on: mockoon-seed: { condition: service_completed_successfully }`, so
   it waits until seeding finishes. If `jq` fails, the seed container exits non-zero and `mockoon`
   won't start — better than silently booting with stale or empty state.
