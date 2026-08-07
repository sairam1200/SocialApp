#!/usr/bin/env bash
#
# Proves that .gitleaks.toml still catches what it is supposed to catch.
#
# A secret scanner fails in two directions, and only one of them is visible. A scan
# that reports noise is loud and gets fixed. A scan that reports nothing because an
# allowlist is too wide looks exactly like a scan that reports nothing because the
# code is clean, and stays that way until something leaks.
#
# This is not hypothetical here. The allowlist for the evaluation admin UI was first
# written with `matchCondition = "AND"`. gitleaks ignores unknown config keys without
# a warning, so the condition never applied, the allowlist fell back to its "OR"
# default, and the file's path alone exempted it — every real credential in that file
# would have passed. The scan was green throughout. The correct key is `condition`.
# Case B below is what caught it.
#
# The cases run against a throwaway copy of the tree, never the working tree, so this
# is safe to run at any time and leaves nothing to clean up or accidentally commit.
#
#   ./scripts/verify-gitleaks-allowlist.sh
#
# Run it whenever .gitleaks.toml changes. Exit 0 means every case behaved.
#
set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
REPO="$PWD"
CONFIG="${GITLEAKS_CONFIG:-$REPO/.gitleaks.toml}"
REL='src/app/(dashboard)/admin/evaluation'
TARGET="$REL/evaluation-ui.util.ts"
DOC='docs/SECRET_SCANNING.md'

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks not installed (brew install gitleaks)" >&2
  exit 127
fi

if [ -t 1 ]; then
  GREEN=$'\033[32m'; RED=$'\033[31m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  GREEN=''; RED=''; DIM=''; RESET=''
fi

SANDBOX="$(mktemp -d "${TMPDIR:-/tmp}/gitleaks-allowlist.XXXXXX")"
trap 'rm -rf "$SANDBOX"' EXIT

# Every planted value below is a SHA-256 digest of a fixed seed word, injected through
# a printf placeholder so that no literal in this file is itself a match. That is
# deliberate: this script necessarily contains credential shapes, and the alternative —
# allowlisting its path — would make the one file guaranteed to hold secret-shaped
# text the one file the scanner never reads. Nothing here is, or has ever been, real.
fixture() {
  local seed="$1" len="${2:-32}"
  if command -v shasum >/dev/null 2>&1; then
    printf '%s' "gaddr-scan-fixture-$seed" | shasum -a 256 | cut -c1-"$len"
  else
    printf '%s' "gaddr-scan-fixture-$seed" | sha256sum | cut -c1-"$len"
  fi
}

mkdir -p "$SANDBOX/$REL" "$SANDBOX/$(dirname "$DOC")"
cd "$SANDBOX" || exit 1

FAILED=0

# Restore the sandbox to a byte-for-byte copy of the committed files.
reset_target() {
  cp "$REPO/$TARGET" "$SANDBOX/$TARGET"
  cp "$REPO/$DOC" "$SANDBOX/$DOC"
  rm -f "$SANDBOX/$REL/other-helper.ts"
}

# check <expectation: clean|leak> <label>
# Scans with --source=. so gitleaks sees the same relative paths as the real scan;
# an absolute --source produces absolute File strings that no `^src/...` path
# allowlist can match, which would make every case pass for the wrong reason.
check() {
  local expect="$1" label="$2"
  rm -f "$SANDBOX/report.json"
  gitleaks detect --source=. --no-git --config="$CONFIG" --no-banner \
    --report-format=json --report-path="$SANDBOX/report.json" >/dev/null 2>&1

  # No report means gitleaks never scanned — almost always a config it could not
  # parse. Say so, rather than letting it read as a failed assertion about scoping.
  if [ ! -f "$SANDBOX/report.json" ]; then
    printf '%s  FAIL%s  %s %s(gitleaks wrote no report — config did not load)%s\n' \
      "$RED" "$RESET" "$label" "$DIM" "$RESET"
    gitleaks detect --source=. --no-git --config="$CONFIG" --no-banner 2>&1 | sed 's/^/        /'
    FAILED=1
    return
  fi

  local count
  count="$(python3 -c 'import json,sys; print(len(json.load(open(sys.argv[1]))))' "$SANDBOX/report.json")"

  if { [ "$expect" = "clean" ] && [ "$count" -eq 0 ]; } ||
     { [ "$expect" = "leak" ] && [ "$count" -gt 0 ]; }; then
    printf '%s  PASS%s  %s\n' "$GREEN" "$RESET" "$label"
  else
    printf '%s  FAIL%s  %s %s(expected %s, got %s finding(s))%s\n' \
      "$RED" "$RESET" "$label" "$DIM" "$expect" "$count" "$RESET"
    FAILED=1
  fi

  python3 - "$SANDBOX/report.json" <<'PY'
import json, sys
for f in json.load(open(sys.argv[1])):
    print(f"        \033[2m{f['RuleID']} at {f['File']}:{f['StartLine']}\033[0m")
PY
}

echo "Verifying $(basename "$CONFIG") against $(gitleaks version 2>/dev/null || echo gitleaks)"
echo

# The committed tree is clean. If this fails, the allowlist is too narrow and the
# gate is about to cry wolf.
reset_target
check clean "A  committed file, unmodified"

# The point of the whole exercise: exempting the metric-key comparison must not
# exempt the file. A credential here is still a credential.
reset_target
printf '\nconst evaluationApiKey = "%s";\n' "$(fixture apikey)" >> "$TARGET"
check leak "B  planted API key in the allowlisted file"

# The exemption is bound to one path. The same shape elsewhere is not pre-approved.
reset_target
printf 'export function f(key: string) {\n  if (key === "%s") return 1;\n  return 0;\n}\n' \
  'p95LatencyMs' > "$REL/other-helper.ts"
check leak "C  same comparison in a different file"

# Fails closed: a metric added to EvaluationMetricKey but not to the allowlist trips
# the gate, so extending the exemption is a deliberate act rather than a default.
reset_target
printf '\nif (key === "%s") { }\n' 'hallucinationRateAt5' >> "$TARGET"
check leak "D  metric key not named in the allowlist"

# The two repo-specific rules still fire inside the allowlisted file.
reset_target
printf '\nconst NEXT_PUBLIC_SUPABASE_%s = "x";\n' 'SECRET' >> "$TARGET"
check leak "E  server secret behind NEXT_PUBLIC_"

reset_target
printf '\nconst t = "ya29.%s";\n' "$(fixture oauth 64)" >> "$TARGET"
check leak "F  platform OAuth token in frontend source"

# The exemption also covers the two documents that quote the offending comparison.
# They are prose, so nothing should ever assign a credential in them — which is exactly
# the assumption worth testing, since it is the assumption that ages badly.
reset_target
printf '\n`const docsApiKey = "%s"`\n' "$(fixture docs)" >> "$DOC"
check leak "G  planted API key in the allowlisted document"

reset_target
check clean "H  sandbox restored to committed content"

echo
if [ "$FAILED" -eq 0 ]; then
  printf '%sAll cases behaved. The allowlist is scoped, not blanket.%s\n' "$GREEN" "$RESET"
else
  printf '%sSome cases failed — .gitleaks.toml is wider (or narrower) than intended.%s\n' "$RED" "$RESET"
fi
exit "$FAILED"
