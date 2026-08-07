---
name: gaddr-collaboration
description: Working alongside other agents and people in this frontend repository — avoiding interference in a shared working tree, staging your own paths, the AGENT_LOG protocol, worktrees, rebasing safely, handing over, and the collision hotspots specific to this repo (translation catalogues, docs/index.md, AGENTS.md). Use before any multi-file change, when git status shows files you did not edit, when another worker may be active, or when finishing a stretch of work.
when_to_use: Trigger phrases include "another agent", "in parallel", "at the same time", "who is working on", "git status shows", "files I did not edit", "uncommitted work", "hand off", "handover", "pause point", "someone else's changes", "merge conflict", "rebase", "AGENT_LOG", "before I commit", "am I done", and any moment you are about to commit, push, rebase, or run a repo-wide fix.
---

# Working alongside other agents and people

Every rule here was paid for on 2026-07-26/27, when two agent sessions and a human worked in
these repositories at the same time. **The canonical protocol lives in the backend** at
[`docs/COLLABORATION.md`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend/blob/main/docs/COLLABORATION.md);
the frontend companion is [`docs/COLLABORATION.md`](../../../docs/COLLABORATION.md).

## The two rules that prevent almost everything

```bash
npx eslint src --fix        # NO  — rewrites files belonging to whoever else is in the tree
npx eslint <your-paths> --fix   # yes

git add -A                  # NO  — commits whatever else is in flight, under your message
git add <your-paths>        # yes
```

Before committing, read `git status` and account for **every** file. If you cannot explain why
a file is modified, it is not yours — leave it.

## Before you start

1. Read [`AGENT_LOG.md`](../../../AGENT_LOG.md). Is anyone still going, and where?
2. `git status`. Anything already modified belongs to someone else until proven otherwise.
3. Append your own entry: what you are doing, which paths, what you are staying out of.

## Is another worker active *right now*?

`git status` shows uncommitted work but not whether anyone is still typing. File modification
times do — but **use an absolute timestamp**:

```bash
find src docs -type f -newermt "$(date -v-10M '+%Y-%m-%dT%H:%M:%S')" | head   # macOS
find src docs -type f -newermt "$(date -d '10 min ago' '+%Y-%m-%dT%H:%M:%S')" | head  # GNU
```

Not `-newermt "-10 minutes"`. On this machine `find` is `bfs`, which rejects the relative form —
and piped into `head` the error goes to stderr while stdout stays empty, so it looks exactly
like "nobody is active". It reported an empty tree here while another session was writing to it.
**A check that fails silently is worse than no check**, because you act on it.

Something modified two minutes ago means a live session. **Then you do not touch that tree at
all** — not to commit their work "so it isn't lost", not to run the gate, not to format. Work
in the other repository, or in a worktree, and say so in your log entry.

When the answer is ambiguous — writes ten minutes ago, nothing since — treat it as live. The
cost of waiting is a delay; the cost of being wrong is someone else's work in your commit.

This is how the 2026-07-27 close-out was handled: an uncommitted provider/OIDC foundation of
~28 files was live in the backend, so all closing work went into the frontend instead and the
backend was left untouched.

## Collision hotspots in this repo

```
src/i18n/messages/{en,sv}.json   every user-facing string; both must change together
docs/index.md                     every new document adds a row
AGENTS.md                         every new convention adds a row
src/services/api/*.service.ts     every new endpoint adds a method
src/hooks/useCommunity.ts         query keys for the whole social layer
```

**Never reformat a translation catalogue.** A script that rewrites indentation turns seven new
keys into an 823-line diff that hides everything else in it. Preserve 2-space indent and key
order; add keys, never re-sort.

## Finding someone else's unfinished work

Do not commit it. Do not finish it. Review it, report it, stage only your own paths, and record
it in [`docs/HANDOFF.md`](../../../docs/HANDOFF.md) so it is not mistaken for abandoned code.

Exception: a change your own work needs to be correct. Make the smallest possible one and say in
the commit that the surrounding feature is someone else's.

## Rebase, then re-run the gate

```bash
git pull --rebase origin main
./scripts/ci.sh                 # must pass on the COMBINED result
```

Green before a rebase proves nothing about after. Your change plus theirs is a third state
neither of you tested.

## A busy machine fails tests that are not broken

Another session compiling in the same checkout saturates the CPU, and Vitest's default 5 s
timeout then fails ordinary tests with `Test timed out in 5000ms`. It happened twice here — the
same tests passed on a quiet machine minutes later. `vitest.config.ts` now sets a 20 s timeout
so contention cannot fake a failure.

Before you believe a red gate, check whether you were sharing the machine:

```bash
grep -E "✓ (Typecheck|Lint)" /path/to/ci.log     # 392 s and 1374 s means saturated, not broken
```

Re-running until it passes is not the fix and hides real failures. If the timings are absurd,
say so and re-run when the machine is free.

## When a whole suite fails at once, suspect the harness

A real regression is narrow. Total failure is nearly always environment, build, or fixture. Here
all 78 Playwright tests failed together because `scripts/ci.sh` built without
`NEXT_PUBLIC_API_BASE_URL` at step 5 and the Playwright build at step 6 was a Turbopack cache
hit — so the browser suite ran the earlier bundle, whose API base was the string `"undefined"`.
It read as a feature regression and was a build artefact.

Before debugging the feature: does the server serve what you think it serves?

```bash
grep -rl "/api/v1" .next/static/chunks | head    # is the base URL even in the bundle?
```

## Finishing: what a good pause point is

Someone else must be able to pick this up **without asking you anything**:

1. `./scripts/ci.sh` green — the real gate, not just `yarn test`.
2. Nothing of yours uncommitted. Pushed, or listed in the handoff as deliberately unfinished
   with the reason.
3. [`docs/HANDOFF.md`](../../../docs/HANDOFF.md) current: done / remains / blocked and on whom.
4. A closing `AGENT_LOG.md` entry naming the pushed commit.
5. No branches left behind. `git branch -r --no-merged origin/main` must be empty.

The handoff document is the deliverable, not a courtesy.

## Attribution

Commits carry `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`. Note that this does
**not** distinguish two agent sessions from each other — on 2026-07-26 two sessions produced
identical author and trailer, and only the `AGENT_LOG.md` entries told them apart. That is what
the log is for. Name the other worker when you build on their code.
