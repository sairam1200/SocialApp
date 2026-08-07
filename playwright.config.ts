import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration.
 *
 * These tests exist because unit tests could not catch the class of defect that
 * actually broke this product. The backend collected content from other platforms,
 * persisted it, and returned it as `aggregated` — and the frontend dropped the field on
 * the floor. Every unit test on both sides passed. Only rendering the page in a browser
 * shows whether a result reaches the screen.
 *
 * The specs under `e2e/` intercept the API at the network layer rather than requiring a
 * running backend and database. That is deliberate: it makes them deterministic and
 * runnable in CI on every push, and the contract they assert — "given this API response,
 * this appears on screen" — is exactly the link that was broken. The complementary
 * full-stack verification against a real Postgres and the live YouTube API is recorded
 * in the backend's docs/integrations/END_TO_END_VERIFICATION.md.
 */
export default defineConfig({
  testDir: './e2e',

  /**
   * Serial, single worker.
   *
   * Two browser projects running in parallel against one Next server produced timeouts
   * that had nothing to do with the code: desktop failed while mobile passed purely on
   * scheduling, and the pattern moved between runs. A search results page fires a
   * debounced request per keystroke-equivalent and re-renders on response, so it is
   * sensitive to a starved event loop.
   *
   * These specs take well under a minute serially. Determinism is worth more than the
   * parallelism — a flaky e2e suite gets disabled, which is the worst outcome.
   */
  fullyParallel: false,
  workers: 1,

  // Never allow a committed `test.only` to silently narrow the suite in CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3210',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Mobile matters here: the product has a custom mobile menu and the brief calls out
    // responsive behaviour explicitly.
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  /**
   * Playwright starts the app itself, so the E2E step works from a clean checkout with
   * no separate terminal.
   *
   * A **production build**, not a dev server. Dev mode compiles each route on first
   * request, and that contention — not any defect — is what pushed navigations past a
   * 30 s timeout when two browser projects ran together. Building once removes the cause
   * instead of absorbing it with long timeouts, makes runs deterministic, and has the
   * added merit of exercising the bundle that actually ships.
   *
   * **Not `yarn build && yarn start`.** `packageManager` pins yarn@4 while the committed
   * lockfile is Yarn Classic v1, so anything routed through yarn dies with "@gaddr/frontend
   * @workspace:. This package doesn't seem to be present in your lockfile" — see
   * docs/TOOLCHAIN.md. `scripts/ci.sh` gained a fallback for that on 2026-08-06, but this
   * command is a second, separate entry point into the same trap: the gate would call the
   * Playwright binary correctly and Playwright would then shell out to a yarn that cannot
   * run, so the E2E step still could not start its own server. Measured that day — the
   * suite was only runnable by bypassing this block with E2E_BASE_URL. Calling the Next
   * binary directly is what the package.json scripts expand to anyway, so this runs the
   * same thing without asking a package manager that cannot answer.
   * `src/gate-toolchain.test.ts` fails if a yarn call reappears here while the lockfile is
   * still Classic.
   *
   * **The suite needs the backend on :8080.** These specs mock at the browser with
   * `page.route`, but the pages render on the server first, and that render calls the API
   * through the next.config rewrite. With nothing on 8080 the server logs ~23,800
   * ECONNREFUSED and 42 of 86 tests fail — measured identically on two different commits,
   * so it is a missing prerequisite rather than a regression. Start the backend before
   * believing a red run.
   *
   * Set `E2E_BASE_URL` to skip this block entirely and run against an already-running
   * server. Locally `reuseExistingServer` reuses whatever is already on 3210 rather than
   * failing on a port clash.
   */
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command:
          './node_modules/.bin/next build && ./node_modules/.bin/next start --port 3210',
        url: 'http://localhost:3210',
        reuseExistingServer: !process.env.CI,
        /**
         * Generous because the build itself is most of this.
         *
         * Raised from 300 s on 2026-08-06: a production build here overran five minutes
         * while other agent sessions were compiling in the same checkout, and Playwright
         * aborted with "Timed out waiting 300000ms from config.webServer" before a single
         * test ran. That reads as a broken suite and is a busy machine — the same failure
         * `vitest.config.ts` documents when it raised its own timeout to 20 s. Contention
         * should not be able to fake a red gate; a genuinely stuck build still fails, just
         * later. If you are waiting this long routinely, build once and point the suite at
         * it with E2E_BASE_URL rather than sitting through a rebuild per run.
         */
        timeout: 600_000,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          // Same value the client now defaults to, stated explicitly so this run
          // does not depend on that default. It used to be load-bearing: the
          // client built its base URL with a template literal, so a missing
          // variable became the *string* `"undefined"` and every request went to
          // `/undefined/...` — resolved relative to the current page, quietly
          // 404ing instead of failing loudly. `apiClient.service.ts` falls back
          // to the next.config rewrite now, so an env-less build works too.
          NEXT_PUBLIC_API_BASE_URL: '/api/v1',
        },
      },
})
