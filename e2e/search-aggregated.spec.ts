import { expect, test, type Page } from '@playwright/test'

/**
 * Does aggregated cross-platform content actually reach the screen?
 *
 * This is the test for the defect that unit tests could not catch. The backend fans out
 * to twelve platforms, persists every result into `contentStreams`, and returns them as
 * `aggregated`. The frontend ignored that field entirely — so results were saved,
 * returned by the API, and never rendered. Both sides' unit tests passed throughout.
 *
 * The API is intercepted at the network layer, so these run without a backend or
 * database, deterministically, on every push. The complementary full-stack run against
 * real Postgres and the live YouTube API is recorded in the backend's
 * docs/integrations/END_TO_END_VERIFICATION.md.
 *
 * Navigation uses `/discover?q=<term>` rather than typing into the search box. The page
 * treats that parameter as a first-class entry point (it is how the header search bar
 * navigates), so the test exercises a real contract instead of coupling to the current
 * shape of the search UI.
 *
 * Note the results page splits results across tabs: "Profiles" (the default) renders
 * items whose type is `profile` — meaning specifically a *Gaddr* profile with a
 * publicProfile payload — and "Contents" renders everything else. Aggregated results are
 * always the latter, including external channels: they are somebody's YouTube account,
 * not a Gaddr user, so they render as content with a platform badge and an outbound link
 * rather than as a follow-able profile card. These tests therefore assert on the Contents
 * tab.
 */

const VIDEO_TITLE = 'PHOTOGRAPHY BASICS in 10 MINUTES'
const CHANNEL_TITLE = 'Design Theory Channel'
const OPENVERSE_TITLE = 'Stockholm City Hall at dusk'
const HACKERNEWS_TITLE = 'Show HN: a search engine with no ads'

/** Matches what `GET /api/v1/search/results` actually returns. */
function searchResultsPayload(
  options: { withAggregated?: boolean } = { withAggregated: true },
) {
  const aggregated = options.withAggregated
    ? [
        {
          id: 'cs-yt-1',
          platform: 'youtube',
          type: 'Content',
          subType: 'video',
          title: VIDEO_TITLE,
          description: 'Learn the fundamentals of exposure',
          thumbnailUrl: 'https://i.ytimg.com/vi/e2eVideoId/hqdefault.jpg',
          url: 'https://www.youtube.com/watch?v=e2eVideoId',
          externalId: 'e2eVideoId',
          lastRefreshed: '2026-07-25T12:00:00.000Z',
        },
        {
          // A channel — maps to a `profile` result, so it lands on the default tab.
          id: 'cs-yt-2',
          platform: 'youtube',
          type: 'Profile',
          subType: 'channel',
          title: CHANNEL_TITLE,
          description: 'A channel about design',
          thumbnailUrl: 'https://yt3.ggpht.com/e2eChannel=s800',
          url: 'https://www.youtube.com/channel/UCe2eChannelId',
          externalId: 'UCe2eChannelId',
          lastRefreshed: '2026-07-25T12:00:00.000Z',
        },
        {
          // Openverse: the licensed case. Its whole value is media a user can *prove*
          // they may reuse, so the licence has to reach the screen — a CC-BY image
          // rendered without attribution breaches the licence that made it usable.
          id: 'cs-ov-1',
          platform: 'openverse',
          type: 'Content',
          subType: 'image',
          title: OPENVERSE_TITLE,
          description: 'by Rob Young',
          thumbnailUrl: 'https://upload.example.invalid/stadshuset.jpg',
          url: 'https://www.flickr.com/photos/e2e/12345',
          externalId: 'ov-e2e-1',
          lastRefreshed: '2026-07-25T12:00:00.000Z',
          creator: 'Rob Young',
          license: {
            code: 'by-sa',
            version: '4.0',
            url: 'https://creativecommons.org/licenses/by-sa/4.0/',
          },
        },
        {
          // Hacker News: a platform with no bundled brand SVG and no licence. Proves the
          // monogram fallback attributes it, and that no licence is invented for it.
          id: 'cs-hn-1',
          platform: 'hackernews',
          type: 'Content',
          subType: 'story',
          title: HACKERNEWS_TITLE,
          description: 'Discussion',
          thumbnailUrl: null,
          url: 'https://search.marginalia.nu/',
          externalId: 'hn-e2e-1',
          lastRefreshed: '2026-07-25T12:00:00.000Z',
          creator: 'fellowshipofone',
          license: null,
        },
      ]
    : []

  return {
    profiles: [],
    contents: [],
    aggregated,
    pagination: {
      page: 1,
      limit: 12,
      profiles: { total: 0 },
      contents: { total: 0 },
      aggregated: { total: aggregated.length },
    },
  }
}

/**
 * Intercept everything the results page calls.
 *
 * Matched on a path glob rather than an exact URL: the client reaches the API through
 * the next.config rewrite, and the query string varies with debounce and pagination.
 */
async function stubSearchApi(
  page: Page,
  options: { withAggregated?: boolean } = { withAggregated: true },
) {
  // Predicate matchers, not globs: the request URL depends on NEXT_PUBLIC_API_BASE_URL
  // and the query string varies with debounce and pagination, so substring matching is
  // both simpler to reason about and harder to get subtly wrong.
  await page.route(
    (url) => url.pathname.endsWith('/search/results'),
    async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(searchResultsPayload(options)),
      })
    },
  )

  // Autocomplete fires on the same input; keep it empty so it can never be mistaken for
  // the results being asserted.
  await page.route(
    (url) => url.pathname.endsWith('/search/suggestions'),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ suggestions: [] }),
      })
    },
  )
}

/**
 * Navigate to a search URL and wait for the results request to resolve.
 *
 * The waiter is registered BEFORE navigating, deliberately. `page.goto` resolves on
 * `load`, while the search request fires later — after hydration and a 120 ms debounce.
 * Calling `waitForResponse` after `goto` therefore races: if the response lands in the
 * gap it is missed, and the test then waits out its full timeout for a second request
 * that never comes. This cost a debugging cycle; registering first removes the race.
 *
 * `tab=contents` is explicit because the default search tab is now **All**, which is
 * served by unified search and never calls `/search/results`. Everything below is about
 * the aggregated per-type results, so it has to ask for that tab rather than assume it.
 */
async function gotoSearch(page: Page, term: string) {
  const results = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith('/search/results') &&
      response.status() === 200,
    { timeout: 45_000 },
  )

  await page.goto(`/discover?q=${encodeURIComponent(term)}&tab=contents`)
  await results
}

/** Console errors that are environmental rather than rendering failures. */
function isIrrelevantError(text: string): boolean {
  return /favicon|net::ERR|Failed to load resource|ytimg|ggpht|HMR|_next\/static|hydrat/i.test(
    text,
  )
}

test.describe('aggregated cross-platform results', () => {
  test('renders aggregated content on the Contents tab', async ({ page }) => {
    await stubSearchApi(page)
    await gotoSearch(page, 'photography')
    await page.getByRole('tab', { name: 'Contents', exact: true }).click()

    // The assertion that matters: content the backend collected from YouTube and
    // persisted to its own database is visible on screen. Before the frontend consumed
    // `aggregated`, this failed while every unit test on both sides passed.
    await expect(page.getByText(VIDEO_TITLE, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    })
  })

  test('renders an external channel as content, not as a profile card', async ({ page }) => {
    // A channel is not a Gaddr profile. Rendering it via ProfileCard produced a blank
    // card with a non-functional follow button — found by this spec while the unit tests
    // were green.
    await stubSearchApi(page)
    await gotoSearch(page, 'design')
    await page.getByRole('tab', { name: 'Contents', exact: true }).click()

    await expect(page.getByText(CHANNEL_TITLE, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    })
  })

  test('survives an API response with no aggregated field', async ({ page }) => {
    // An older backend omits it. Treating that as an error would break the whole results
    // page rather than one section, which is why the client reads it with `?? []`.
    await stubSearchApi(page, { withAggregated: false })

    const errors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })

    await gotoSearch(page, 'photography')

    // The page must remain interactive — the tab control still responds.
    await expect(
      page.getByRole('tab', { name: 'Contents', exact: true }),
    ).toBeVisible({ timeout: 30_000 })

    expect(errors.filter((t) => !isIrrelevantError(t))).toEqual([])
  })

  test('logs no rendering errors while showing aggregated results', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })

    await stubSearchApi(page)
    await gotoSearch(page, 'design')
    await page.getByRole('tab', { name: 'Contents', exact: true }).click()
    await expect(page.getByText(VIDEO_TITLE, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    })

    // Thumbnails point at real CDN hosts unreachable from a test runner, so image load
    // failures are expected and filtered. A React render error is not.
    expect(errors.filter((t) => !isIrrelevantError(t))).toEqual([])
  })
})

test.describe('the results page itself', () => {
  test('loads and renders its search controls', async ({ page }) => {
    await stubSearchApi(page)
    await page.goto('/discover')

    await expect(
      page.getByRole('button', { name: 'Search', exact: true }),
    ).toBeVisible({ timeout: 60_000 })
  })

  test('does not scroll horizontally at mobile width', async ({ page }) => {
    // A horizontally scrolling body is the most common responsive regression, and the
    // brief calls out mobile explicitly.
    await stubSearchApi(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await gotoSearch(page, 'design')
    await page.getByRole('tab', { name: 'Contents', exact: true }).click()

    await expect(page.getByText(VIDEO_TITLE, { exact: false }).first()).toBeVisible({
      timeout: 30_000,
    })

    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    )
    expect(overflows).toBe(false)
  })
})

/**
 * Source attribution and licence.
 *
 * `renderPlatformIcon` used to return `null` for any platform without a bundled brand
 * SVG — which was four of the five platforms that actually return data. Results rendered
 * with no indication of where they came from, and for an aggregation product that reads
 * as if Gaddr wrote them. Same defect shape as the one this file was created for: the
 * data was present in the API response and absent from the screen.
 */
test.describe('source attribution', () => {
  test('names the source for a platform with no brand icon', async ({ page }) => {
    await stubSearchApi(page)
    await gotoSearch(page, 'marginalia')
    await page.getByRole('tab', { name: 'Contents', exact: true }).click()

    // Substring, not the full title: the card truncates at 34 characters via
    // buildContentText, so an exact match asserts on the truncation rather than on
    // whether the row rendered.
    await expect(page.getByText('Show HN: a search engine').first()).toBeVisible()
    await expect(
      page.getByRole('img', { name: 'Hacker News' }).first(),
    ).toBeVisible()
    // The footer names it in full — a two-letter monogram is recognisable, not
    // self-explanatory.
    await expect(page.getByText('Hacker News', { exact: true }).first()).toBeVisible()
  })

  test('shows the licence and creator for openly-licensed media', async ({ page }) => {
    await stubSearchApi(page)
    await gotoSearch(page, 'stockholm')
    await page.getByRole('tab', { name: 'Contents', exact: true }).click()

    await expect(page.getByText(OPENVERSE_TITLE)).toBeVisible()
    await expect(page.getByText('Rob Young').first()).toBeVisible()

    // Linked to the deed, so the obligation is actionable rather than decorative.
    const deed = page.getByRole('link', { name: 'BY-SA 4.0' }).first()
    await expect(deed).toBeVisible()
    await expect(deed).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-sa/4.0/',
    )
    // noreferrer as well as noopener: the deed link must not leak the user's search.
    const rel = (await deed.getAttribute('rel')) ?? ''
    expect(rel).toContain('noopener')
    expect(rel).toContain('noreferrer')
  })

  test('invents no licence for content that has none', async ({ page }) => {
    await stubSearchApi(page)
    await gotoSearch(page, 'stockholm')
    await page.getByRole('tab', { name: 'Contents', exact: true }).click()

    // Absent terms are NOT permissive terms. The YouTube and Hacker News rows carry no
    // licence, and implying reuse is allowed would be worse than showing nothing.
    await expect(page.getByText(VIDEO_TITLE)).toBeVisible()
    await expect(page.getByRole('link', { name: /^CC|^BY|^PDM/ })).toHaveCount(1)
  })
})

/**
 * The result count, and why it is not cosmetic.
 *
 * `useSearch` read `pagination.contents.total` alone. That counts only Gaddr-native
 * content, which is 0 for essentially every real search, while `aggregated` holds
 * everything collected from other platforms. So the tab read "0 contents" above a
 * screenful of visible results.
 *
 * The count also gates the pagination controls, so a zero hid them and made page 2 of
 * aggregated results unreachable — a functional loss, not a wrong label.
 */
test.describe('aggregated results are counted, not just rendered', () => {
  test('counts aggregated rows in the Contents total', async ({ page }) => {
    await stubSearchApi(page)
    await gotoSearch(page, 'stockholm')
    await page.getByRole('tab', { name: 'Contents', exact: true }).click()

    // The fixture has 0 native contents and 4 aggregated rows.
    await expect(page.getByText('4 contents')).toBeVisible()
    await expect(page.getByText('0 contents')).toHaveCount(0)
  })
})
