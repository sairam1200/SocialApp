# Roadmap — making the gate prove things

The gate exists to answer one question: *is this change safe to merge?* On 2026-08-06 it
could answer four of its six steps honestly; the secret scan became the fifth on
2026-08-07. This is the ordered path to six, plus the reachability sweep started the same
day.

One caveat that survives the ✅ in §1: a step can be green and still not be answering the
question you think it is. The secret scan reports zero, and it has never read a commit —
which is a correct answer to "is anything about to be committed" and no answer at all to
"has anything been". §2 item 5 is that gap, with the measurement.

**Scope.** This is about the machinery that verifies the product, not the product. Feature
and audit work is [`HANDOFF.md`](HANDOFF.md) §3 and stays the priority; nothing here
outranks it. The package-manager decision appears in both because it is the root cause of
half this list.

---

## 1. Where the gate stands

Measured on merged `main`, in a clean detached worktree.

| Step | Runs? | Last measured | What blocks it |
|---|---|---|---|
| Typecheck | ✅ | 0 errors | — |
| Lint | ✅ | 0 errors, **261 warnings** | warnings have never been triaged |
| Unit (Vitest) | ✅ | 227 passed, 40 files | — |
| Secret scan | ✅ | 0 findings in the working tree | — but it only scans the working tree; **9 findings in history**, see §2 item 5 |
| Build | ✅ | green, 62 routes | — |
| E2E (Playwright) | ⚠️ | **42 of 86 fail** | no backend on `:8080` |

Two of these were worse until 2026-08-06 and are worth knowing about, because both failed
*silently in the direction of looking like code defects*:

- `scripts/ci.sh` routed every step through `corepack yarn`, which cannot read this repo's
  Yarn Classic lockfile. Typecheck, Lint and Tests reported **FAILED without executing**.
  Fixed with a fallback to `node_modules/.bin`.
- `playwright.config.ts` then still ran `yarn build && yarn start` for its own server — a
  second entry point into the same trap, so the E2E step could not start the app even
  after the gate was fixed. Now calls the Next binary directly.

[`src/gate-toolchain.test.ts`](../src/gate-toolchain.test.ts) fails if either reappears
while the lockfile is still Classic, and retires itself when it is not.

## 2. Next steps, in order

| # | Step | Size | Done when |
|---|---|---|---|
| ~~1~~ | ~~Allowlist the gitleaks false positive~~ | S | ✅ **Done** `8038269` — see below |
| 2 | Make an absent backend say so | M | Running E2E with nothing on `:8080` fails in seconds with that sentence, not 42 assertion failures |
| 3 | Decide the lockfile | L | `corepack yarn type-check` runs at all; the `ci.sh` fallback and §5 of TOOLCHAIN.md are deleted in the same change |
| 4 | Triage the 261 lint warnings | M | Either zero, or a ratchet that fails on *new* ones |
| **5** | **Rotate the credentials in `f56433d`, and decide about `env.local`** | **M** | **The eight values are dead at the provider, and `env.local` is either untracked or deliberately kept** |
| 6 | Finish the reachability sweep | S each | §3 below |
| 7 | Re-baseline the counts in the docs | S | No number in prose that a command contradicts |

### 1 — The secret scan's one finding ✅ done

`generic-api-key` on `src/app/(dashboard)/admin/evaluation/evaluation-ui.util.ts:21`.
Allowlisted in `8038269`, scoped to the rule, the paths and the match shape, with
`condition = "AND"` so all three must hold.

Two corrections to what stood here, both of which changed the work:

- The line is **not** a function signature with a parameter named `key`. The match is
  `key === "p95LatencyMs"` — a comparison. `generic-api-key` reads the identifier `key`
  beside a quoted string as an assignment. The exemption had to constrain the match, not
  the file, so the description mattered.
- "Scoped to path + rule" is not sufficient on its own. gitleaks combines allowlist
  clauses with **OR** by default, so a path plus a rule means *either* is enough, and the
  path alone exempts the whole file. `condition = "AND"` is what makes it a conjunction —
  and gitleaks ignores that key silently if you misspell it, with no change in output.
  [`scripts/verify-gitleaks-allowlist.sh`](../scripts/verify-gitleaks-allowlist.sh)
  exists to catch exactly that; full account in
  [`SECRET_SCANNING.md`](SECRET_SCANNING.md) §5.

### 2 — An absent backend should be a sentence, not 42 failures

The browser specs stub the API with `page.route`, but pages server-render first and that
render calls the API through the `next.config.ts` rewrite — which `page.route` cannot
intercept. With nothing on `:8080` the server logs ~23,800 `ECONNREFUSED` and 42 of 86
tests fail on assertions that name none of it.

Cheapest useful fix: a precondition check in `scripts/ci.sh` and/or a Playwright global
setup that probes `:8080` and refuses with the reason. Document the prerequisite next to
the E2E instructions either way. The backend checkout is `../backend`.

Verify by running the suite with the backend down and reading only the first ten lines of
output — if they do not say what is wrong, it is not done.

### 3 — The lockfile decision

Full options and costs in [`TOOLCHAIN.md`](TOOLCHAIN.md) §5 and `HANDOFF.md` §3 item 1.
This is a decision, not a chore: Vercel selects its package manager from the lockfile
*format*, so changing it changes what production installs, and it must be verified against
a preview deployment rather than a local success.

It is third rather than first because the workarounds hold and are tested, so this can be
done deliberately. It is on the list because every workaround it retires is a place where
the repository describes something that is not true.

### 4 — 261 lint warnings

`eslint` exits 0, so the gate is green while 261 warnings accumulate. Mostly
`no-explicit-any` and unused vars. Either clear them or ratchet, but a permanently
non-zero warning count trains everyone to ignore the lint step — the same failure mode as
item 1, one level up.

### 5 — The gate never reads history, and history is not clean

The scan runs `--no-git`, so it is a pre-commit net rather than an audit. Dropping that
flag on 2026-08-07 at `8038269` reported **9 findings across 297 commits**, against **0**
in the working tree.

Eight are one incident: `env.local` at `f56433d` (2026-08-03) carried real values,
including a 101-character `gaddr-platform-token` at entropy 4.93 and a `facebook-secret`.
They were replaced in `9e744ac`, so the tree is clean today — but `git show
f56433d:env.local` still returns them for anyone with repository access. The ninth is a
true positive of a *design* flaw rather than a leak: a `NEXT_PUBLIC_*_SECRET` variable in
an old README — a secret behind a public prefix — since removed with no references left.

**Rotation is the fix, and it is not blocked on anything.** Scrubbing history is a
separate and much more expensive question — `filter-repo` and BFG rewrite every
subsequent commit hash and break every open branch and worktree in the team, which
[`../AGENTS.md`](../AGENTS.md) forbids doing casually. Rotate first; decide about history
second, deliberately.

The recurrence risk is separate and is the part worth fixing structurally: `env.local` is
**tracked and not gitignored**. It holds placeholders today, so the next person to fill it
in locally has a live credential staged by default. Untracking it has deployment
consequences, so it is a decision rather than a drive-by edit.

Detail, and the triage commands that print no values:
[`SECRET_SCANNING.md`](SECRET_SCANNING.md) §6–§7.

### 7 — Numbers in prose that are already wrong

`docs/index.md` §5 says 143 Vitest tests and 78 Playwright tests; both are stale, and the
Playwright figure is quoted in two more places. Re-measure and fix, then prefer "run this
command" over a number wherever possible.

## 3. Track 2 — finish the reachability sweep

Started 2026-08-06 by deleting `src/contexts/goodbye/page.tsx`, an unreachable byte-for-byte
copy of a routed page that still compiled, and so forced every edit to the real page to be
made twice. Guarded by [`src/route-reachability.test.ts`](../src/route-reachability.test.ts)
and explained in [`gaddr-reachability`](../.claude/skills/gaddr-reachability/SKILL.md).

What the same sweep found and did not remove, smallest first:

| Item | Where | Note |
|---|---|---|
| Two empty modules | `src/constants/enums.ts`, `src/types/account/linkedAccount.type.ts` | 0 bytes each. Delete unless something imports them for a side effect |
| Six unreferenced dependencies | `secure-ls`, `jsonwebtoken`, `nodemailer`, `reflect-metadata`, `js-cookie`, `init` | `docs/index.md` §5. Removing them is the cheapest bundle win available |
| Duplicate libraries | two form libraries, two validators, two crop libraries, two UI primitive sets | Larger; pick one per pair as you touch the code |
| Built but unwired | icon, illustration and empty-state sets across the Gaddr products | Grep for callers **before** building another set |

Each is independently shippable. Do them as you pass through, not as a project.

## 4. How to prove a change today

```bash
./scripts/ci.sh --fast    # typecheck, lint, unit, secrets — minutes
./scripts/ci.sh           # + build and Playwright — needs the backend on :8080
```

Single checks, when you want one answer:

```bash
npx tsc --noEmit --skipLibCheck
npx vitest run
npx eslint "src/**/*.ts" "src/**/*.tsx"
```

Three things that make a result trustworthy, all learned expensively:

1. **Baseline before you change anything.** A shared tree is often already red for reasons
   that are not yours.
2. **Verify in a detached worktree, not the shared checkout** — that tree usually holds
   another session's uncommitted work, so a red result there says nothing about your commit.
3. **Check the machine before believing a red gate.** `uptime` above twice the core count
   means contention. This machine reached a load average of 328 during a routine run.

See [`COLLABORATION.md`](COLLABORATION.md) for the full protocol.

---

## Related

- [`HANDOFF.md`](HANDOFF.md) §3 — product priorities; item 1 is the lockfile decision
- [`SECRET_SCANNING.md`](SECRET_SCANNING.md) — the secret gate in full: what is exempt and why, how to widen an exemption without blinding the scanner, and the history audit behind item 5
- [`TOOLCHAIN.md`](TOOLCHAIN.md) — the package-manager contradiction in full
- [`COLLABORATION.md`](COLLABORATION.md) — working in a shared tree, and why a whole suite failing means the harness
- [`gaddr-frontend-testing`](../.claude/skills/gaddr-frontend-testing/SKILL.md) · [`gaddr-reachability`](../.claude/skills/gaddr-reachability/SKILL.md)
