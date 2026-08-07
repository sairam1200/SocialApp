---
name: gaddr-reachability
description: Proving a file is actually reached before you edit, trust or duplicate it — App Router reachability (only src/app is routed), unimported modules, byte-identical copies of pages, and the guard test that enforces both. Use before deleting something that looks dead, when the same edit has to be made in two files to keep the build green, when adding a file that resembles one that already exists, or when a change to a page does not show up in the browser.
when_to_use: Trigger phrases include "is this file used", "is this dead code", "nothing imports", "unused", "orphan", "duplicate file", "same file twice", "I had to change it in both places", "keep the typecheck green", "why didn't my change show up", "the page didn't update", "safe to delete", "remove this file", "copy of the page", "unreachable", "not routed", "outside src/app", and any moment you are about to delete a source file or add one that mirrors an existing one.
---

# Is this file actually reached?

Paid for on 2026-08-06. `src/contexts/goodbye/page.tsx` was a byte-for-byte copy of the routed
`src/app/goodbye/page.tsx`. Nothing imported it, no URL served it — and it still cost real time,
because a brand change had to be applied to **both** files in lockstep to keep `tsc --noEmit`
green: the unreachable copy still imported the artwork the change was removing.

**A copy that compiles is worse than dead code.** Dead code you can ignore. A second copy is a
second place you have to remember, and the build only tells you about it after you have
forgotten.

## Only `src/app` is routed

`page`, `layout`, `route`, `template`, `default`, `loading`, `error`, `not-found`, and the
metadata files (`icon`, `apple-icon`, `opengraph-image`, `twitter-image`, `sitemap`, `robots`,
`manifest`) mean something **only** under `src/app`. Anywhere else in `src/` they are inert:
Next never reaches them, so they render for nobody while still typechecking.

This is why "I changed the page and nothing happened" is sometimes not a cache problem. You may
have edited the copy. Check which file the router actually owns before debugging further.

## The 30-second check, before you trust or delete a file

```bash
grep -rn "the-module-name" src e2e scripts     # who imports it? (no hits = nobody)
find src -not -path "src/app/*" -name "page.tsx" -o -not -path "src/app/*" -name "route.ts"
npx vitest run src/route-reachability.test.ts  # both rules, on the whole tree
```

Three things worth knowing when you read the result:

- **`grep` for the import path, not the symbol.** `BookmarkContext` matches its own definition
  and looks used even when nothing consumes it; `@/contexts/BookmarkContext` matches importers.
- **Absence of importers is not absence of use** for anything under `src/app` — the router is
  the caller, and it never appears in a grep. Reachability there is a question about the *path*,
  not the imports.
- **A file can be reached and still be pointless.** Reachability is the cheap half; whether
  anything renders it is the other half.

## The tell

> The same edit had to be made in two files to keep the build green.

That is not a coincidence and it is not a code style problem. It means a duplicate exists.
Find it and delete one, in that change — not later.

## The guard

[`src/route-reachability.test.ts`](../../../src/route-reachability.test.ts) enforces two rules
over the whole tree, and names the offending path when it fails:

| Rule | Catches |
|---|---|
| No route-shaped filename outside `src/app` | The original bug — a `page.tsx` that is not a page |
| No file outside `src/app` byte-identical to a routed file | The same copy after it has been renamed to something rule 1 misses |

What it deliberately does **not** assert is "no two files under `src/` share content". Six
`loading.tsx` boundaries here are legitimately identical, because the App Router wants one per
segment — that rule would have failed on correct code the day it was written. Rule 2 fires only
when the twin is outside `src/app`.

If you add a rule here, check it against the tree as it is *before* you commit it. A structural
test that is red on arrival gets disabled, and then it protects nothing.

## Deleting in this repository

The tree usually has someone else's uncommitted work in it, so removal has its own protocol —
see [`gaddr-collaboration`](../gaddr-collaboration/SKILL.md).

1. **Prove it is unreachable**, both ways: no importers, and not routed.
2. **Diff before you delete.** If the file is a copy, confirm byte-for-byte
   (`diff a b` or compare hashes) so you know nothing unique dies with it. Uncommitted edits to
   a duplicate are only safe to discard once you have proved they also exist in the original.
3. **Baseline first.** Run `npx tsc --noEmit --skipLibCheck` and `npx vitest run` *before* the
   deletion. A shared tree is often already red for reasons that are not yours, and without the
   baseline you will be blamed for — or worse, chase — someone else's failure.
4. **Stage by path.** `git add <your-paths>`, never `git add -A`.
5. **Re-run both** and compare to the baseline. Identical counts is the proof that nothing
   depended on what you removed.

## Related shapes of unreachable in this repo

| Shape | Where it shows up |
|---|---|
| Empty modules | `src/constants/enums.ts` and `src/types/account/linkedAccount.type.ts` are 0 bytes |
| Unreferenced dependencies | Six, listed in [`docs/index.md`](../../../docs/index.md) §5 under *Bundle duplication* |
| Built but unwired | Icon, illustration and empty-state sets exist across the Gaddr products with almost no call sites. **Grep for callers before building another one** |

Use `npm`/`npx` here, not `yarn` — the committed lockfile is Yarn Classic v1 while
`packageManager` pins Yarn 4, so `yarn` aborts with *"@gaddr/frontend@workspace:. This package
doesn't seem to be present in your lockfile"*. `scripts/ci.sh` works around the same thing by
calling the binaries in `node_modules/.bin`.
