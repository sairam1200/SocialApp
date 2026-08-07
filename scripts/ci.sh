#!/usr/bin/env bash
#
# Local CI gate for the Gaddr frontend.
#
# Vercel builds and deploys this repository, so `yarn build` is effectively the
# deployment gate — but Vercel does NOT run typecheck or lint as separate steps,
# and `next build` succeeds even when `tsc` reports errors it does not surface.
# That gap is real: `yarn type-check` was failing with 130 errors on a clean clone
# while `yarn build` passed green, so 130 type errors were invisible.
#
# Run this before pushing.
#
#   ./scripts/ci.sh              # everything, including Playwright
#   ./scripts/ci.sh --fast       # skip the production build and E2E
#   ./scripts/ci.sh --no-e2e     # skip Playwright only
#   ./scripts/ci.sh --no-secrets # skip the secret scan
#
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

FAST=0
RUN_SECRETS=1
RUN_E2E=1
for arg in "$@"; do
  case "$arg" in
    --fast) FAST=1; RUN_E2E=0 ;;
    --no-secrets) RUN_SECRETS=0 ;;
    --no-e2e) RUN_E2E=0 ;;
    -h|--help) sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [ -t 1 ]; then
  BOLD=$'\033[1m'; GREEN=$'\033[32m'; RED=$'\033[31m'; YELLOW=$'\033[33m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  BOLD=''; GREEN=''; RED=''; YELLOW=''; DIM=''; RESET=''
fi

# This repo pins yarn@4 via packageManager, and corepack is how that is honoured.
# Calling bare `yarn` may resolve to a globally installed yarn 1.x, which cannot
# read a v4 lockfile.
if command -v corepack >/dev/null 2>&1; then
  YARN=(corepack yarn)
elif command -v yarn >/dev/null 2>&1; then
  YARN=(yarn)
else
  echo "Neither corepack nor yarn found. Install corepack: npm i -g corepack" >&2
  exit 1
fi

# The committed yarn.lock is a **Yarn Classic v1** lockfile ("# yarn lockfile v1"
# on line 2) while package.json pins `packageManager: yarn@4.9.2`. Yarn 4 cannot
# read a v1 lockfile: every script aborts with
#
#   Internal Error: @gaddr/frontend@workspace:.: This package doesn't seem to be
#   present in your lockfile; run "yarn install" to update the lockfile
#
# and `yarn install --immutable` can never pass, because passing would require
# rewriting the lockfile into v8 format, which is the one thing --immutable
# forbids. So this gate — the gate AGENTS.md tells everyone to run before
# pushing — could not run at all, and had not been running. Vercel is unaffected
# because it selects a package manager from the lockfile *format* it finds, so
# production builds with Yarn Classic while the repository claims Yarn 4.
#
# Regenerating the lockfile is the real fix and it is a deliberate decision, not
# a side effect of running CI: it re-resolves every dependency and changes what
# production installs. Until somebody makes that call, run the gate through the
# binaries in node_modules/.bin with the same argv package.json uses. That is
# what the scripts expand to anyway, so the gate tests exactly what it did
# before — it simply stops asking a package manager that cannot answer.
LOCKFILE_IS_CLASSIC=0
if [ -f yarn.lock ] && head -5 yarn.lock | grep -q 'yarn lockfile v1'; then
  LOCKFILE_IS_CLASSIC=1
fi

# npm has read and written yarn.lock since npm 7, and it resolves optional
# dependencies for the platform it is running on. So the install this gate runs
# when node_modules is missing does not just populate node_modules — it rewrites
# the tracked lockfile to match this machine. Observed: `@img/sharp-win32-x64`
# replaced by `@img/sharp-darwin-arm64`, a 64-insertion diff, simply by running
# the gate on a clean clone. `--no-save` suppresses package-lock.json but not
# that rewrite.
#
# yarn.lock is the file Vercel reads to choose a package manager and to resolve
# what production installs, so a gate that edits it as a side effect of being run
# is worse than a gate that does not run. Keep the install, discard its opinion
# about the lockfile.
npm_install_preserving_lockfile() {
  local backup status=0
  backup="$(mktemp)"

  # Restore on interrupt as well. A Ctrl-C during a multi-minute install is the
  # one moment this function is not covering, and it is the moment that would
  # leave the rewritten lockfile behind.
  trap 'cp -- "$backup" yarn.lock 2>/dev/null; rm -f -- "$backup"; exit 130' INT TERM

  cp -- yarn.lock "$backup"
  npm install --no-audit --no-fund || status=$?

  # `cp` onto the existing file rather than `mv` from the temp file. `mv` carries
  # mktemp's 0600 across, quietly tightening a tracked file from 0644 — and git
  # records only the executable bit, so nothing would ever show that it happened.
  # Copying into the existing inode keeps the mode the repository already had.
  cp -- "$backup" yarn.lock
  rm -f -- "$backup"
  trap - INT TERM
  return "$status"
}

if [ "$LOCKFILE_IS_CLASSIC" -eq 1 ]; then
  printf '%s\n⚠  yarn.lock is a Yarn Classic v1 file but packageManager pins yarn@4.9.2.\n' "$YELLOW"
  printf '   Yarn 4 cannot read it, so this gate runs the tools from node_modules/.bin\n'
  printf '   instead. Resolve by regenerating the lockfile with Yarn 4, or by pinning\n'
  printf '   packageManager to the Yarn that actually produced it.%s\n' "$RESET"

  BIN=./node_modules/.bin
  run_typecheck=("$BIN/tsc" --noEmit --skipLibCheck)
  run_lint=("$BIN/eslint" "src/**/*.ts" "src/**/*.tsx")
  run_test=("$BIN/vitest" run)
  run_build=("$BIN/next" build)
  run_e2e_cmd=("$BIN/playwright" test)
  INSTALL=(npm_install_preserving_lockfile)
else
  run_typecheck=("${YARN[@]}" type-check)
  run_lint=("${YARN[@]}" lint)
  run_test=("${YARN[@]}" test)
  run_build=("${YARN[@]}" build)
  run_e2e_cmd=("${YARN[@]}" e2e)
  INSTALL=("${YARN[@]}" install --immutable)
fi

FAILED=()
STEP_NUM=0

run_step() {
  local label="$1"; shift
  STEP_NUM=$((STEP_NUM + 1))

  printf '\n%s[%d] %s%s\n' "$BOLD" "$STEP_NUM" "$label" "$RESET"
  printf '%s    $ %s%s\n' "$DIM" "$*" "$RESET"

  local start
  start=$(date +%s)

  if "$@"; then
    printf '%s    ✓ %s (%ss)%s\n' "$GREEN" "$label" "$(( $(date +%s) - start ))" "$RESET"
  else
    printf '%s    ✗ %s (%ss)%s\n' "$RED" "$label" "$(( $(date +%s) - start ))" "$RESET"
    FAILED+=("$label")
  fi
}

printf '%sGaddr frontend — CI gate%s\n' "$BOLD" "$RESET"
printf '%snode %s · %s%s\n' "$DIM" "$(node -v)" "$("${YARN[@]}" --version 2>/dev/null)" "$RESET"

# A saturated machine fails this gate in ways that look like code defects, and that has
# already cost real time: with three workspaces building at once the load average hit 200,
# ordinary tests failed on a 5 s timeout, Vitest could not spawn workers at all, and
# `next build` was SIGTERMed by the OS *after* reporting "compiled successfully" — in 38
# minutes rather than one. None of it was the code. Warn up front so the next person reads
# a red gate correctly instead of debugging a feature that is fine.
LOAD_1="$(uptime | sed 's/.*load averages*: *//' | awk '{print int($1)}')"
CORES="$( (sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null) || echo 8 )"
if [ "${LOAD_1:-0}" -gt "$(( CORES * 2 ))" ]; then
  printf '%s\n⚠  Load average is %s on %s cores — another workspace is likely building.\n' \
    "$YELLOW" "$LOAD_1" "$CORES"
  printf '   Failures below may be contention rather than defects. Re-run when it is quiet\n'
  printf '   before believing a red result.%s\n' "$RESET"
fi

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  printf '\n%snode_modules missing — installing%s\n' "$DIM" "$RESET"
  "${INSTALL[@]}"
fi

run_step "Typecheck" "${run_typecheck[@]}"
run_step "Lint" "${run_lint[@]}"
run_step "Tests" "${run_test[@]}"

if [ "$RUN_SECRETS" -eq 1 ]; then
  if command -v gitleaks >/dev/null 2>&1; then
    # --no-git scans the working tree. .gitleaks.toml allowlists build output and
    # verified false positives (React component names tripping platform-ID rules,
    # and EvaluationMetricKey comparisons tripping generic-api-key) and adds rules
    # for the real frontend risks: a server secret behind NEXT_PUBLIC_, and platform
    # OAuth tokens reaching the client.
    #
    # Every exemption is scoped to a rule and a path, never a bare file exemption.
    # ./scripts/verify-gitleaks-allowlist.sh proves that by planting a credential in
    # each place one could hide; run it whenever .gitleaks.toml changes. Rationale
    # and the procedure for adding an exemption: docs/SECRET_SCANNING.md.
    run_step "Secret scan" gitleaks detect --source=. --no-git \
      --config=.gitleaks.toml --redact --no-banner
  else
    printf '\n%s[-] Secret scan skipped — gitleaks not installed (brew install gitleaks)%s\n' "$DIM" "$RESET"
  fi
fi

if [ "$FAST" -eq 0 ]; then
  run_step "Build" "${run_build[@]}"
fi

# Playwright. Last because it is the slowest: it builds and starts its own production
# server on port 3210, and the build is most of that time.
#
# This is the step that catches what the others cannot: every unit test on both sides
# passed while aggregated search results were saved, returned by the API, and never
# rendered. Only a browser shows whether a result reaches the screen.
if [ "$RUN_E2E" -eq 1 ]; then
  if [ -d node_modules/@playwright ]; then
    run_step "E2E (Playwright)" "${run_e2e_cmd[@]}"
  else
    printf '\n%s[-] E2E skipped — run: corepack yarn playwright install chromium%s\n' "$DIM" "$RESET"
  fi
fi

printf '\n'
if [ ${#FAILED[@]} -eq 0 ]; then
  printf '%s✓ All checks passed%s\n' "$GREEN$BOLD" "$RESET"
  exit 0
fi

printf '%s✗ %d check(s) failed:%s\n' "$RED$BOLD" "${#FAILED[@]}" "$RESET"
for name in "${FAILED[@]}"; do
  printf '%s    - %s%s\n' "$RED" "$name" "$RESET"
done
exit 1
