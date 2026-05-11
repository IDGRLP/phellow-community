#!/bin/sh
# Smoke test for scripts/mockoon-snapshot.sh.
#
# Exercises the two pieces of logic that aren't trivially obvious from reading
# the script: the generational prune algorithm and the .value-based dedup hash.
#
# Runs on the host (Darwin/Linux) — no Docker needed. Requires `jq` and a
# `touch -d <iso8601>` that accepts ISO timestamps (BusyBox, GNU, BSD all do).
#
# Usage:   sh scripts/mockoon-snapshot.test.sh
# Exits 0 on success, 1 on first assertion failure.
#
# Fixture timestamps are floored to bucket boundaries (hour/day/week) so the
# test is deterministic regardless of the wall-clock minute-of-hour when run.

set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Source the script as a library; main() is gated on this sentinel.
MOCKOON_SNAPSHOT_LIB=1 . "$SCRIPT_DIR/mockoon-snapshot.sh"

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "ok - $*"; }

NOW=$(date -u +%s)
TESTDIR=$(mktemp -d)
trap 'rm -rf "$TESTDIR"' EXIT
SNAPDIR="$TESTDIR/snaps"
mkdir -p "$SNAPDIR"

# Floor helpers — match the prune function's bucket keys.
floor_hour() { echo $(( $1 / 3600 * 3600 )); }
floor_day()  { echo $(( $1 / 86400 * 86400 )); }
floor_week() { echo $(( $1 / 604800 * 604800 )); }

# mk_file MTIME -> basename of the created snapshot file
mk_file() {
  mt=$1
  iso=$(date -u -r "$mt" +%Y-%m-%dT%H:%M:%SZ)
  name=$(date -u -r "$mt" +%Y%m%dT%H%M%SZ)
  : > "$SNAPDIR/qres-${name}.json"
  touch -d "$iso" "$SNAPDIR/qres-${name}.json"
  printf '%s\n' "qres-${name}.json"
}

# ---------------------------------------------------------------------------
# Fixture
# ---------------------------------------------------------------------------

# Recent (<12h) — all three kept verbatim.
R1=$(mk_file $(( NOW - 1 * 3600 )))
R2=$(mk_file $(( NOW - 3 * 3600 )))
R3=$(mk_file $(( NOW - 11 * 3600 - 30 * 60 )))

# Hourly bucket A: 13h-ago hour, three files inside it.
HA_FLOOR=$(floor_hour $(( NOW - 13 * 3600 )))
H_A_OLD=$(mk_file $(( HA_FLOOR + 5 * 60 )))
H_A_MID=$(mk_file $(( HA_FLOOR + 25 * 60 )))
H_A_NEW=$(mk_file $(( HA_FLOOR + 45 * 60 )))

# Hourly bucket B: 18h-ago hour, two files inside it.
HB_FLOOR=$(floor_hour $(( NOW - 18 * 3600 )))
H_B_OLD=$(mk_file $(( HB_FLOOR + 10 * 60 )))
H_B_NEW=$(mk_file $(( HB_FLOOR + 50 * 60 )))

# Daily bucket: ~72h ago, floored to UTC day; three files spread across it.
DAY_FLOOR=$(floor_day $(( NOW - 72 * 3600 )))
D_OLD1=$(mk_file $(( DAY_FLOOR + 6 * 3600 )))
D_OLD2=$(mk_file $(( DAY_FLOOR + 12 * 3600 )))
D_NEW=$(mk_file  $(( DAY_FLOOR + 18 * 3600 )))

# Weekly bucket: ~15d ago, floored to (epoch / 604800); two files inside it.
WEEK_FLOOR=$(floor_week $(( NOW - 15 * 86400 )))
W_OLD=$(mk_file $(( WEEK_FLOOR + 1 * 86400 )))
W_NEW=$(mk_file $(( WEEK_FLOOR + 5 * 86400 )))

# Monthly bucket: three files ~60d ago, seconds apart, so they share a UTC
# month except in the (vanishingly rare) case that NOW-60d is within ~2 min
# of a month boundary.
M_BASE=$(( NOW - 60 * 86400 ))
M_OLD1=$(mk_file $M_BASE)
M_OLD2=$(mk_file $(( M_BASE + 60 )))
M_NEW=$(mk_file  $(( M_BASE + 120 )))

EXPECTED_KEPT="$R1
$R2
$R3
$H_A_NEW
$H_B_NEW
$D_NEW
$W_NEW
$M_NEW"

EXPECTED_REMOVED="$H_A_OLD
$H_A_MID
$H_B_OLD
$D_OLD1
$D_OLD2
$W_OLD
$M_OLD1
$M_OLD2"

BEFORE=$(ls "$SNAPDIR" | wc -l | tr -d ' ')
[ "$BEFORE" = "16" ] || fail "fixture setup: expected 16 files, got $BEFORE"
pass "fixture: 16 files staged"

# ---------------------------------------------------------------------------
# Run prune.
# ---------------------------------------------------------------------------
SNAPSHOT_DIR="$SNAPDIR" BUCKET_ID="qres" prune

# ---------------------------------------------------------------------------
# Assertions
# ---------------------------------------------------------------------------
echo "$EXPECTED_KEPT" | while IFS= read -r f; do
  [ -n "$f" ] || continue
  [ -f "$SNAPDIR/$f" ] || fail "expected kept but missing: $f"
done
pass "all expected-kept files survived"

echo "$EXPECTED_REMOVED" | while IFS= read -r f; do
  [ -n "$f" ] || continue
  [ ! -e "$SNAPDIR/$f" ] || fail "expected pruned but still present: $f"
done
pass "all expected-pruned files removed"

AFTER=$(ls "$SNAPDIR" | wc -l | tr -d ' ')
[ "$AFTER" = "8" ] || fail "expected 8 survivors, got $AFTER"
pass "survivor count = 8 (3 recent + 2 hourly + 1 daily + 1 weekly + 1 monthly)"

# ---------------------------------------------------------------------------
# hash_value: same .value but different whitespace/key-order -> same hash.
# Different .value -> different hash.
# ---------------------------------------------------------------------------
cat > "$TESTDIR/a.json" <<'EOF'
{"name":"x","value":[{"id":"qr-1","status":"completed"}]}
EOF
cat > "$TESTDIR/b.json" <<'EOF'
{"value":[{"status":"completed","id":"qr-1"}],
 "name":"x"}
EOF
cat > "$TESTDIR/c.json" <<'EOF'
{"name":"x","value":[{"id":"qr-1","status":"in-progress"}]}
EOF

HA=$(hash_value "$TESTDIR/a.json")
HB=$(hash_value "$TESTDIR/b.json")
HC=$(hash_value "$TESTDIR/c.json")

[ "$HA" = "$HB" ] || fail "hash_value: identical .value (reformatted) hashed differently ($HA vs $HB)"
pass "hash_value: identical .value -> same hash (whitespace/key-order insensitive)"

[ "$HA" != "$HC" ] || fail "hash_value: different .value hashed the same"
pass "hash_value: different .value -> different hash"

echo
echo "All tests passed."
