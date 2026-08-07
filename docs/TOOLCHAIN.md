# Package manager and the local gate

**Short version:** this repository says Yarn 4 and ships a Yarn Classic v1 lockfile. Every
`corepack yarn` command therefore fails. `./scripts/ci.sh` works around it and is the way to
run checks today. The underlying contradiction is unresolved on purpose — fixing it changes
what production installs, so it is [`HANDOFF.md`](HANDOFF.md) §3 item 1, not a chore.

---

## 1. The contradiction

Four things describe the package manager, and three of them agree with each other and not
with the fourth.

| Where | What it says | Implies |
|---|---|---|
| `package.json` → `packageManager` | `yarn@4.9.2` | Yarn 4 |
| `.yarnrc.yml` | `nodeLinker: node-modules` | Yarn 2+ — Yarn 1 does not read this file at all |
| `.gitignore` | `/.pnp`, `.pnp.*`, `.yarn/*`, `!.yarn/releases` | Yarn 2+ (Berry) |
| **`yarn.lock`** | **`# yarn lockfile v1` on line 2** | **Yarn 1 (Classic)** |

Yarn 4 cannot read a v1 lockfile. So any command routed through the pinned package manager
stops before it does anything:

```
Internal Error: @gaddr/frontend@workspace:.: This package doesn't seem to be present in
your lockfile; run "yarn install" to update the lockfile
```

`yarn install --immutable` cannot fix it either: passing would require rewriting the lockfile
into the v8 format, which is precisely what `--immutable` forbids.

## 2. Why this went unnoticed

Three reinforcing reasons, all worth knowing because each one can recur:

- **Vercel is unaffected**, so production kept building. Vercel selects a package manager from
  the lockfile *format* it finds — it finds v1 and uses Yarn Classic. The repository claims
  Yarn 4 and production installs with Yarn 1, and nothing surfaces the disagreement.
- **There are no GitHub Actions workflows in this repository.** `scripts/ci.sh` is the entire
  gate. When it broke, nothing else was watching.
- **The documentation explained the pin backwards.** `AGENTS.md` told every reader to use
  `corepack yarn` because "a global yarn 1.x cannot read this lockfile" — the exact inverse of
  the truth. The lockfile is v1; yarn 1.x is the only yarn that *can* read it. Anyone hitting
  the error and consulting the docs was sent back at the thing that was failing. Corrected
  2026-08-06.

The failure mode was quiet in the worst way: the gate reported Typecheck, Lint and Tests as
**FAILED** without executing any of them. A red gate that never ran looks exactly like a red
gate that ran.

## 3. How to run checks today

Use the gate. It detects the Classic lockfile and runs the tools directly:

```bash
./scripts/ci.sh --fast     # typecheck, lint, unit tests, secret scan
./scripts/ci.sh            # everything, including the build and Playwright
```

For a single check, call the binary rather than the package manager:

```bash
npx tsc --noEmit --skipLibCheck
npx vitest run
npx eslint "src/**/*.{ts,tsx}"
node scripts/verify-gaddr-production.mjs --strict
```

The fallback runs the same argv the `package.json` scripts expand to, so the gate tests what it
always tested. The one cosmetic difference is lint: `package.json` uses the brace glob
`src/**/*.{ts,tsx}` and the fallback passes `src/**/*.ts` and `src/**/*.tsx` separately. These
were measured against each other — **561 files either way**.

## 4. Why the gate restores `yarn.lock`

When `node_modules` is missing the gate installs with npm, and **npm has read and written
`yarn.lock` since npm 7**. It also resolves optional dependencies for the platform it runs on.
So a single clean-clone gate run rewrote the tracked lockfile: `@img/sharp-win32-x64` became
`@img/sharp-darwin-arm64`, 64 insertions and 27 deletions, purely from having been run on a Mac.

`yarn.lock` is what Vercel reads to choose a package manager and to resolve what production
installs. A gate that edits it as a side effect of being run is worse than a gate that does not
run, so `scripts/ci.sh` snapshots the lockfile, installs, and restores it.

Two things learned building that guard, both of which will bite again:

- **`--no-save` is not the fix.** It suppresses `package-lock.json` but not the `yarn.lock`
  rewrite.
- **Restore with `cp`, never `mv`.** `mv` from a `mktemp` file carries `0600` across and quietly
  tightens the lockfile from `0644`. Git records only the executable bit, so nothing would ever
  show that it happened — the first version of this guard did exactly that and it was caught by
  comparing file modes across worktrees, not by `git status`.

## 5. Resolving it properly

Pick deliberately and **verify against a Vercel preview**, because the lockfile is what
production installs from.

| Option | Cost | Consequence |
|---|---|---|
| **Regenerate with Yarn 4** — `corepack yarn install`, commit the v8 lockfile | Re-resolves every dependency | Matches the repo's stated intent and makes all documented commands work. Flips Vercel onto Yarn 4, because the lockfile format is what it selects on. Verify a preview deploy before merging |
| **Repin `packageManager` to `yarn@1.22.x`** | None — no re-resolution | Makes the claim match the lockfile actually shipped, and matches what Vercel already does. Lowest risk, but freezes on an end-of-life Yarn and leaves `.yarnrc.yml` as dead config |
| **Move to npm** | Re-resolves; adds `package-lock.json` | `.gitignore` currently ignores `package-lock.json` with the comment *"Dual lockfiles make installs non-deterministic — this repo uses yarn"*. This contradicts a stated policy, so it should be an explicit reversal of it rather than drift |

Whichever is chosen, the fallback in `scripts/ci.sh` becomes dead code and should be removed in
the same change — along with this section — so the repository stops describing a workaround it
no longer needs.

**Do not resolve it by running `npm install` and committing the result.** See §4: that commits a
platform-specific lockfile shaped by whichever machine happened to run it.

## 6. Verifying a fix

A change to the lockfile or the pin is not done until all of these hold:

```bash
corepack yarn type-check        # must run at all, then report 0 errors
./scripts/ci.sh                 # green end to end, from a wiped node_modules
git status --short              # yarn.lock unmodified after the run
stat -f '%Lp' yarn.lock         # still 0644
```

Then confirm a Vercel **preview deployment** builds and serves before merging to `main` — the
package manager it selects is the thing being changed, and a local success does not test that.

---

## Related

- [`HANDOFF.md`](HANDOFF.md) §3 item 1 — the decision, in priority order with the rest of the work
- [`COLLABORATION.md`](COLLABORATION.md) — gate facts, and why a whole suite failing at once means the harness
- [`../AGENTS.md`](../AGENTS.md) — "Verify your work"
- [`../scripts/ci.sh`](../scripts/ci.sh) — the detector, the fallback and the lockfile guard
