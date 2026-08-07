import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The gate must not route through a package manager that cannot read the lockfile.
 *
 * `packageManager` pins yarn@4.9.2; the committed `yarn.lock` is Yarn Classic v1.
 * Yarn 4 cannot read a v1 lockfile, so every `yarn …` call aborts with "@gaddr/
 * frontend@workspace:. This package doesn't seem to be present in your lockfile"
 * — before running anything. The full background is docs/TOOLCHAIN.md.
 *
 * This has now been paid for twice, in two different files:
 *
 *   1. `scripts/ci.sh` called `corepack yarn type-check|lint|test`, so the gate
 *      reported Typecheck, Lint and Tests as FAILED without executing any of
 *      them. A red gate that never ran looks exactly like a red gate that ran.
 *      Fixed 2026-08-06 with a fallback to `node_modules/.bin`.
 *   2. `playwright.config.ts` then still ran `yarn build && yarn start` for its
 *      own web server. So even with the gate fixed, the E2E step could not start
 *      the app: the gate called the Playwright binary correctly, and Playwright
 *      shelled straight back into the yarn that cannot run. Measured the same
 *      day — Playwright was only runnable by bypassing the block with
 *      E2E_BASE_URL. Fixed by calling the Next binary directly.
 *
 * Two files is a pattern, so this asserts the invariant rather than the fix.
 *
 * Every assertion is conditional on the lockfile still being Classic. When
 * HANDOFF.md §3 item 1 is decided — regenerate with Yarn 4, or repin to Yarn 1 —
 * the contradiction disappears, these guards go quiet on their own, and the
 * fallback they protect can be deleted. A guard that outlives its reason is
 * noise, so this one is written to retire itself.
 */

function findProjectRoot(): string {
  // Not import.meta.url: under the jsdom environment modules get an http:// URL,
  // so fileURLToPath throws "The URL must be of scheme file".
  let dir = process.cwd();

  for (;;) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "src", "app"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`No project root above ${process.cwd()}`);
    dir = parent;
  }
}

const ROOT = findProjectRoot();
const read = (relative: string) => readFileSync(join(ROOT, relative), "utf8");

/** True while `yarn.lock` is a Yarn Classic v1 file and `packageManager` pins Yarn 2+. */
function lockfileIsClassic(): boolean {
  const lock = read("yarn.lock").split("\n").slice(0, 5).join("\n");
  if (!lock.includes("yarn lockfile v1")) return false;

  const pinned = /"packageManager"\s*:\s*"yarn@(\d+)/.exec(read("package.json"))?.[1];
  return pinned !== undefined && Number(pinned) >= 2;
}

/** The `command:` string inside playwright.config.ts's webServer block. */
function playwrightWebServerCommand(): string {
  const config = read("playwright.config.ts");
  const block = config.slice(config.indexOf("webServer:"));
  const command = /command:\s*(?:\n\s*)?['"`]([\s\S]*?)['"`]\s*,/.exec(block)?.[1];

  if (!command) throw new Error("No webServer command found in playwright.config.ts");
  return command;
}

describe("gate toolchain", () => {
  it("still describes the lockfile contradiction these guards exist for", () => {
    // If this flips to false the contradiction is resolved, and the guards below
    // are vacuously true rather than silently skipped — so read this first.
    expect(typeof lockfileIsClassic()).toBe("boolean");
  });

  it("does not start Playwright's server through yarn while the lockfile is Classic", () => {
    if (!lockfileIsClassic()) return;

    expect(
      playwrightWebServerCommand(),
      "playwright.config.ts's webServer runs this command, and a `yarn` in it cannot " +
        "execute against the committed Yarn Classic lockfile — the E2E step would fail to " +
        "start the app before a single test ran. Call ./node_modules/.bin/next directly, " +
        "as scripts/ci.sh does. See docs/TOOLCHAIN.md.",
    ).not.toMatch(/(^|\s|&|;)(corepack\s+)?yarn\s/);
  });

  it("keeps the ci.sh fallback while the lockfile is Classic", () => {
    if (!lockfileIsClassic()) return;

    expect(
      read("scripts/ci.sh"),
      "scripts/ci.sh must keep detecting the Yarn Classic lockfile and falling back to " +
        "node_modules/.bin. Without it the gate reports Typecheck, Lint and Tests as FAILED " +
        "without running them, which is indistinguishable from real failures.",
    ).toContain("LOCKFILE_IS_CLASSIC");
  });

  it("keeps NEXT_PUBLIC_API_BASE_URL set for the E2E build", () => {
    // Load-bearing: the client once built its base URL with a template literal, so a
    // missing variable became the string "undefined" and every request went to
    // /undefined/... — a whole browser suite failing for a reason no test names.
    expect(
      read("playwright.config.ts"),
      "playwright.config.ts's webServer must keep setting NEXT_PUBLIC_API_BASE_URL, or the " +
        "browser suite runs against a bundle with the wrong API base.",
    ).toMatch(/NEXT_PUBLIC_API_BASE_URL:\s*['"`]\/api\/v1['"`]/);
  });
});
