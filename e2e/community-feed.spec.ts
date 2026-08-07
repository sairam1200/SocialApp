import { expect, test, type Page } from '@playwright/test'

/**
 * Does Community actually reach the screen — and does the reader's choice of
 * feed actually change what is fetched?
 *
 * The API is intercepted at the network layer, so these run without a backend
 * or a database, deterministically, on every push. The complementary full-stack
 * run against real Postgres lives in the backend at
 * `scripts/community-smoke.js`, which drives 44 assertions over HTTP.
 *
 * What this layer is for: the gap *between* correct units. The backend can rank
 * perfectly and the client can hold the data correctly while the tab never
 * changes `mode`, the disclosure label never renders, or the poll shows its
 * results before anyone votes. None of those are visible to a unit test on
 * either side.
 */

const AUTHOR = {
  id: 'profile-anna',
  handle: 'anna',
  displayName: 'Anna Andersson',
  kind: 'creator',
  isVerified: true,
  followersCount: 4200,
  isFollowedByViewer: true,
}

const BRAND = {
  id: 'profile-acme',
  handle: 'acme',
  displayName: 'Acme',
  kind: 'brand',
  isVerified: true,
  followersCount: 98000,
  isFollowedByViewer: false,
}

function post(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-recommended-1',
    kind: 'update',
    status: 'published',
    visibility: 'public',
    author: AUTHOR,
    body: 'Ranked feeds should still let you pick chronological.',
    media: [],
    products: [],
    tags: [],
    topics: ['product'],
    isSponsored: false,
    disclosure: 'none',
    likesCount: 12,
    commentsCount: 2,
    repostsCount: 1,
    sharesCount: 0,
    viewerReaction: null,
    canEdit: false,
    createdOn: '2026-07-25T09:00:00.000Z',
    publishedOn: '2026-07-25T09:00:00.000Z',
    url: 'https://demo.gaddr.com/community/anna/post-recommended-1',
    reasons: ['followed'],
    ...overrides,
  }
}

/**
 * Serve a feed whose contents depend on `mode`.
 *
 * The distinct bodies are the assertion: if the tab did not change the request,
 * the page would keep showing the recommended post.
 */
async function stubFeed(page: Page) {
  const requestedModes: string[] = []

  await page.route('**/api/v1/community/feed**', async (route) => {
    const url = new URL(route.request().url())
    const mode = url.searchParams.get('mode') ?? 'recommended'
    requestedModes.push(mode)

    const items =
      mode === 'latest'
        ? [
            post({
              id: 'post-latest-1',
              body: 'Newest first, no ranking at all.',
              reasons: [],
            }),
          ]
        : [
            post(),
            post({
              id: 'post-sponsored-1',
              body: 'A very good pair of boots.',
              isSponsored: true,
              disclosure: 'paid_partnership',
              sponsor: BRAND,
              reasons: ['sponsored'],
            }),
            post({
              id: 'post-poll-1',
              kind: 'poll',
              body: 'Which feed do you use?',
              reasons: ['topic-match'],
              poll: {
                options: [
                  { id: 'opt-a', label: 'For you', votesCount: 7, share: 0.7 },
                  { id: 'opt-b', label: 'Latest', votesCount: 3, share: 0.3 },
                ],
                totalVotes: 10,
                isClosed: false,
                viewerOptionId: null,
              },
            }),
          ]

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ mode, items, nextCursor: null, hasMore: false }),
    })
  })

  // Anonymous: `/community/me` 401s, and the page must render regardless.
  await page.route('**/api/v1/community/me**', (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
  )

  return requestedModes
}

test.describe('Community feed', () => {
  test('renders posts from the recommended feed', async ({ page }) => {
    await stubFeed(page)
    await page.goto('/community')

    const posts = page.getByTestId('community-post')
    await expect(posts.first()).toBeVisible()
    await expect(
      page.getByText('Ranked feeds should still let you pick chronological.'),
    ).toBeVisible()
  })

  test('the reader can switch to Latest, and it changes what is requested', async ({
    page,
  }) => {
    const modes = await stubFeed(page)
    await page.goto('/community')
    await expect(page.getByTestId('community-post').first()).toBeVisible()

    await page.getByTestId('feed-tab-latest').click()

    await expect(page.getByText('Newest first, no ranking at all.')).toBeVisible()
    expect(modes).toContain('latest')
  })

  test('the chosen feed is in the URL, so it survives a reload', async ({
    page,
  }) => {
    // A preference that only lives in component state is one the product keeps
    // overriding on the next navigation.
    await stubFeed(page)
    await page.goto('/community')
    await page.getByTestId('feed-tab-latest').click()

    await expect(page).toHaveURL(/feed=latest/)

    await page.reload()
    await expect(page.getByText('Newest first, no ranking at all.')).toBeVisible()
  })

  test('a sponsored post always carries its disclosure label', async ({ page }) => {
    await stubFeed(page)
    await page.goto('/community')

    const badge = page.getByTestId('disclosure-badge').first()
    await expect(badge).toBeVisible()
    await expect(badge).toContainText(/paid partnership/i)
  })

  test('a poll hides its results until the reader votes', async ({ page }) => {
    // Showing the tally first anchors the answer.
    await stubFeed(page)
    await page.goto('/community')

    const poll = page.getByTestId('post-poll')
    await expect(poll).toBeVisible()
    await expect(poll).not.toContainText('70%')
  })

  test('ranked posts explain themselves', async ({ page }) => {
    await stubFeed(page)
    await page.goto('/community')

    await expect(page.getByTestId('why-this-post').first()).toBeVisible()
  })

  test('an anonymous reader gets a feed and no composer', async ({ page }) => {
    await stubFeed(page)
    await page.goto('/community')

    await expect(page.getByTestId('community-post').first()).toBeVisible()
    await expect(page.getByTestId('composer')).toHaveCount(0)
  })

  test('an empty feed says so instead of rendering nothing', async ({ page }) => {
    await page.route('**/api/v1/community/feed**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'recommended',
          items: [],
          nextCursor: null,
          hasMore: false,
        }),
      }),
    )
    await page.route('**/api/v1/community/me**', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
    )

    await page.goto('/community')
    await expect(page.getByText(/nothing here yet/i)).toBeVisible()
  })

  test('a failing feed offers a retry rather than a blank screen', async ({
    page,
  }) => {
    await page.route('**/api/v1/community/feed**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
    )
    await page.route('**/api/v1/community/me**', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
    )

    await page.goto('/community')
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible()
  })

  test('the page reports no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })

    await stubFeed(page)
    await page.goto('/community')
    await expect(page.getByTestId('community-post').first()).toBeVisible()

    // Hydration mismatches and missing i18n keys both surface here, and both
    // are invisible to a unit test.
    expect(errors.filter((e) => !e.includes('favicon'))).toEqual([])
  })
})
