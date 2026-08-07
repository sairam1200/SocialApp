import { expect, test, type Page } from '@playwright/test'

/**
 * Explore: does the mixed feed actually reach the screen, and does every
 * control actually change what is fetched?
 *
 * The unit tests already prove the card renders each kind and that the filters
 * write to the URL. What only this layer can see is the round trip — a chip
 * that updates the URL but never reaches the query, a mode tab that renders
 * selected while the request still says `all`, a Gaddr result that arrives
 * badged as ours and then opens off-site anyway.
 *
 * The API is intercepted, so this runs without a backend or a database.
 */

const GADDR_POST = {
  id: 'gaddr:post:1',
  kind: 'post',
  source: { platform: 'gaddr', isNative: true, label: 'Gaddr', externalUrl: null },
  title: 'Shipping the Community layer',
  description: 'A post that lives here.',
  url: '/community/anna/1',
  publishedOn: '2026-07-24T10:00:00.000Z',
  topics: ['product'],
  score: 1,
  reasons: ['on-gaddr'],
}

const GADDR_JOB = {
  id: 'gaddr-jobs:project:9',
  kind: 'project',
  source: {
    platform: 'gaddr-jobs',
    isNative: true,
    label: 'Gaddr Jobs',
    externalUrl: 'https://boards.test/jobs/9',
  },
  title: 'Build a design system',
  description: 'Ours, and hosted on someone else’s board.',
  url: 'https://boards.test/jobs/9',
  publishedOn: '2026-07-23T10:00:00.000Z',
  topics: ['design'],
  metrics: { priceMinor: '500000', currency: 'EUR' },
  score: 0.9,
  reasons: [],
}

const YOUTUBE_VIDEO = {
  id: 'youtube:content:5',
  kind: 'video',
  source: {
    platform: 'youtube',
    isNative: false,
    label: 'YouTube',
    externalUrl: 'https://yt.test/watch?v=5',
  },
  title: 'Someone else’s video',
  url: 'https://yt.test/watch?v=5',
  publishedOn: '2026-07-22T10:00:00.000Z',
  topics: ['design'],
  score: 0.5,
  reasons: [],
}

/**
 * Serve unified search, and record every request it received.
 *
 * The recorded queries are the assertion: a control that changes the URL but
 * not the request looks correct on screen and is broken.
 */
async function stubUnified(page: Page) {
  const requests: URLSearchParams[] = []

  await page.route('**/api/v1/search/unified**', async (route) => {
    const url = new URL(route.request().url())
    requests.push(url.searchParams)

    const mode = url.searchParams.get('mode') ?? 'all'
    const platforms = url.searchParams.get('platforms') ?? ''

    let items = [GADDR_POST, GADDR_JOB, YOUTUBE_VIDEO]
    if (platforms) {
      const wanted = new Set(platforms.split(','))
      items = items.filter((item) => wanted.has(item.source.platform))
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mode,
        keyword: url.searchParams.get('keyword') ?? '',
        items,
        total: items.length,
        hasMore: false,
        sources: [
          { platform: 'gaddr', label: 'Gaddr', isNative: true, count: 1 },
          { platform: 'gaddr-jobs', label: 'Gaddr Jobs', isNative: true, count: 1 },
          { platform: 'youtube', label: 'YouTube', isNative: false, count: 1 },
        ],
        kinds: [
          { kind: 'post', count: 1 },
          { kind: 'project', count: 1 },
          { kind: 'video', count: 1 },
        ],
        topics: [
          { topic: 'design', count: 2 },
          { topic: 'product', count: 1 },
        ],
      }),
    })
  })

  // Explore also asks for people to follow; anonymous is fine.
  await page.route('**/api/v1/community/explore**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        posts: [],
        people: [],
        brands: [],
        products: [],
        courses: [],
        topics: [],
        live: [],
      }),
    }),
  )

  await page.route('**/api/v1/community/me**', (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
  )

  return requests
}

test.describe('Explore', () => {
  test('mixes our own content with other platforms in one list', async ({ page }) => {
    await stubUnified(page)
    await page.goto('/community/explore')

    const results = page.getByTestId('unified-result')
    await expect(results).toHaveCount(3)
    await expect(page.getByText('Shipping the Community layer')).toBeVisible()
    await expect(page.getByText('Someone else’s video')).toBeVisible()
  })

  test('marks what is ours, and does not mark what is not', async ({ page }) => {
    await stubUnified(page)
    await page.goto('/community/explore')

    const badges = page.getByTestId('source-badge')
    await expect(badges.first()).toBeVisible()
    await expect(page.locator('[data-testid="source-badge"][data-platform="gaddr"]'))
      .toHaveAttribute('data-native', 'true')
    await expect(page.locator('[data-testid="source-badge"][data-platform="youtube"]'))
      .toHaveAttribute('data-native', 'false')
  })

  test('keeps a route to the source, including for a job that is ours and hosted elsewhere', async ({
    page,
  }) => {
    await stubUnified(page)
    await page.goto('/community/explore')

    const links = page.getByTestId('open-on-source')
    await expect(links).toHaveCount(2)
    await expect(links.first()).toHaveAttribute('target', '_blank')

    // Nothing to leave for, for a post that lives here.
    const gaddrCard = page.locator('[data-testid="unified-result"][data-kind="post"]')
    await expect(gaddrCard.getByTestId('open-on-source')).toHaveCount(0)
  })

  test('the mode tab changes the request, not just the tab', async ({ page }) => {
    const requests = await stubUnified(page)
    await page.goto('/community/explore')
    await expect(page.getByTestId('unified-result').first()).toBeVisible()

    await page.getByTestId('search-mode-for-you').click()
    await expect
      .poll(() => requests.some((q) => q.get('mode') === 'for-you'))
      .toBe(true)
  })

  test('chronological and random are both reachable', async ({ page }) => {
    const requests = await stubUnified(page)
    await page.goto('/community/explore')
    await expect(page.getByTestId('unified-result').first()).toBeVisible()

    await page.getByTestId('search-mode-latest').click()
    await expect.poll(() => requests.some((q) => q.get('mode') === 'latest')).toBe(true)

    await page.getByTestId('search-mode-random').click()
    await expect.poll(() => requests.some((q) => q.get('mode') === 'random')).toBe(true)
  })

  test('a source filter narrows the list and survives a reload', async ({ page }) => {
    await stubUnified(page)
    await page.goto('/community/explore')
    await expect(page.getByTestId('unified-result')).toHaveCount(3)

    await page.getByTestId('filter-source-gaddr').click()
    await expect(page.getByTestId('unified-result')).toHaveCount(1)

    // The filter is in the URL, so the same link shows the same thing.
    await page.reload()
    await expect(page.getByTestId('unified-result')).toHaveCount(1)
  })

  test('a theme reaches the query', async ({ page }) => {
    const requests = await stubUnified(page)
    await page.goto('/community/explore')
    await expect(page.getByTestId('unified-result').first()).toBeVisible()

    await page.getByTestId('filter-topic-design').click()
    await expect
      .poll(() => requests.some((q) => q.get('topics') === 'design'))
      .toBe(true)
  })

  test('clearing filters keeps the chosen ordering', async ({ page }) => {
    await stubUnified(page)
    await page.goto('/community/explore?mode=latest&platforms=gaddr')

    await page.getByTestId('clear-filters').click()
    await expect(page).toHaveURL(/mode=latest/)
    await expect(page).not.toHaveURL(/platforms=/)
  })
})

test.describe('Search tabs', () => {
  test('All and For you sit alongside the per-type tabs', async ({ page }) => {
    await stubUnified(page)
    await page.goto('/discover?q=design')

    for (const name of ['All', 'For you', 'Profiles', 'Contents', 'Projects']) {
      await expect(page.getByRole('tab', { name, exact: true })).toBeVisible({
        timeout: 30_000,
      })
    }
  })

  test('All holds every kind of result at once', async ({ page }) => {
    // The reason "All" never worked before: there was no list that could hold
    // a profile and a job at the same time.
    await stubUnified(page)
    await page.goto('/discover?q=design')

    await expect(page.getByTestId('unified-result')).toHaveCount(3, {
      timeout: 30_000,
    })
    await expect(
      page.locator('[data-testid="unified-result"][data-kind="project"]'),
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="unified-result"][data-kind="video"]'),
    ).toBeVisible()
  })

  test('For you asks the recommender, not the plain search', async ({ page }) => {
    const requests = await stubUnified(page)
    await page.goto('/discover?q=design')
    await expect(page.getByTestId('unified-result').first()).toBeVisible({
      timeout: 30_000,
    })

    await page.getByRole('tab', { name: 'For you', exact: true }).click()
    await expect.poll(() => requests.some((q) => q.get('mode') === 'for-you')).toBe(true)
  })

  test('the tab is in the URL, so a shared search opens the same way', async ({
    page,
  }) => {
    await stubUnified(page)
    await page.goto('/discover?q=design')
    await page.getByRole('tab', { name: 'For you', exact: true }).click()
    await expect(page).toHaveURL(/tab=for-you/)
  })

  test('one ordering control, not two that can disagree', async ({ page }) => {
    // On a page whose tabs *are* the ordering, the unified list must not also
    // show its own mode row.
    await stubUnified(page)
    await page.goto('/discover?q=design')
    await expect(page.getByTestId('unified-result').first()).toBeVisible({
      timeout: 30_000,
    })

    await expect(page.getByTestId('search-mode-latest')).toBeHidden()
  })
})
