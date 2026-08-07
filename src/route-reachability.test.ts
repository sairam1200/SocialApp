import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Only `src/app` is routed.
 *
 * On 2026-08-06 `src/contexts/goodbye/page.tsx` turned out to be a byte-for-byte
 * copy of the routed `src/app/goodbye/page.tsx`. Nothing imported it, and being
 * outside `src/app` the App Router never reached it, so it rendered for nobody.
 * It still compiled, though — so a brand change had to be applied to *both*
 * files in lockstep to keep `tsc --noEmit` green, and the copy still imported
 * the artwork that change was removing. That is worse than dead weight: dead
 * weight you can ignore, but a second copy that still typechecks is a second
 * place you have to remember, and the build only tells you about it after you
 * have forgotten.
 *
 * The lesson generalises beyond that one file, so these are structural
 * assertions over the tree rather than tests of any component:
 *
 *   1. A file named like a route entry point is unreachable unless it lives
 *      under `src/app` — Next only assigns meaning to these names there.
 *   2. A file outside `src/app` that is byte-identical to a routed file is a
 *      copy of a page, whatever it has been renamed to. This catches the same
 *      mistake when the copy is not called `page.tsx`.
 *
 * Deliberately NOT asserted: "no two files under src share content". Six
 * `loading.tsx` boundaries here are legitimately identical, because the App
 * Router wants one per segment — so that rule would have failed on correct code
 * the day it was written. Rule 2 only fires when the twin is *outside* `src/app`.
 */

/**
 * Locate `src` by ascending from the working directory.
 *
 * Not `import.meta.url`: the jsdom environment gives modules an `http://localhost`
 * URL rather than a `file://` one, so `fileURLToPath` throws "The URL must be of
 * scheme file". Not a bare `process.cwd()` either, so that running Vitest from a
 * subdirectory still resolves the same tree.
 */
function findSrcDir(): string {
  let dir = process.cwd();

  for (;;) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "src", "app"))) {
      return join(dir, "src");
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`No project root above ${process.cwd()}`);
    dir = parent;
  }
}

const SRC_DIR = findSrcDir();

/** Extensions Next treats as modules. `pageExtensions` is unset, so these are the defaults. */
const MODULE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

/**
 * Reserved App Router filenames. Outside `src/app` every one of these is inert.
 *
 * The metadata conventions (`icon`, `opengraph-image`, …) are included because
 * they are just as inert outside `src/app` — an `opengraph-image.tsx` in
 * `src/components` produces no tag and no image. The names are lowercase, and
 * this repository names components in PascalCase, so a component colliding with
 * one is already off-convention; if it ever happens, renaming it is the fix.
 */
const ROUTE_BASENAMES = new Set([
  // Routing conventions
  "default",
  "error",
  "forbidden",
  "global-error",
  "layout",
  "loading",
  "not-found",
  "page",
  "route",
  "template",
  "unauthorized",
  // Metadata conventions
  "apple-icon",
  "icon",
  "manifest",
  "opengraph-image",
  "robots",
  "sitemap",
  "twitter-image",
]);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() ? [full] : [];
  });
}

/** Path relative to `src`, e.g. `app/goodbye/page.tsx` — what a reader recognises. */
function fromSrc(file: string): string {
  return relative(SRC_DIR, file).split(sep).join("/");
}

function isRouted(file: string): boolean {
  const rel = relative(SRC_DIR, file);
  return rel === "app" || rel.startsWith(`app${sep}`);
}

function isModule(file: string): boolean {
  return MODULE_EXTENSIONS.some((extension) => file.endsWith(extension));
}

function basenameWithoutExtension(file: string): string {
  const name = file.split(sep).pop() ?? "";
  const cut = name.lastIndexOf(".");
  return cut === -1 ? name : name.slice(0, cut);
}

const MODULES = walk(SRC_DIR).filter(isModule);

describe("App Router reachability", () => {
  it("finds modules to check", () => {
    // A structural test that silently walks an empty tree passes while asserting
    // nothing, which is the one failure mode these two rules cannot survive.
    expect(MODULES.length).toBeGreaterThan(100);
    expect(MODULES.some(isRouted)).toBe(true);
  });

  it("keeps every route entry point under src/app", () => {
    const stranded = MODULES.filter(
      (file) => !isRouted(file) && ROUTE_BASENAMES.has(basenameWithoutExtension(file)),
    )
      .map(fromSrc)
      .sort();

    expect(
      stranded,
      "These files are named like App Router entry points but sit outside src/app, " +
        "so Next never reaches them. Move the file under src/app to route it, or " +
        "rename it if it is an ordinary module.",
    ).toEqual([]);
  });

  it("has no unrouted copy of a routed file", () => {
    const byContent = new Map<string, string[]>();

    for (const file of MODULES) {
      // Empty files pair with every other empty file and mean nothing. Two exist
      // under src today (src/constants/enums.ts, src/types/account/linkedAccount.type.ts).
      if (statSync(file).size === 0) continue;

      const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
      byContent.set(hash, [...(byContent.get(hash) ?? []), file]);
    }

    const copies = [...byContent.values()]
      .filter((group) => group.length > 1 && group.some(isRouted) && group.some((f) => !isRouted(f)))
      .map((group) => {
        const routed = group.filter(isRouted).map(fromSrc).sort();
        const unrouted = group.filter((f) => !isRouted(f)).map(fromSrc).sort();
        return `${unrouted.join(", ")} duplicates ${routed.join(", ")}`;
      })
      .sort();

    expect(
      copies,
      "These files are byte-identical to a routed page but are not routed themselves. " +
        "Nothing renders them, yet they still typecheck — so every edit to the real " +
        "page has to be repeated here or the build breaks. Delete the copy.",
    ).toEqual([]);
  });
});
