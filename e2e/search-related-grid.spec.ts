import { expect, test, type Page } from '@playwright/test'

type SearchRequest = { searchTerm?: string }

function item(
  id: string,
  type: 'content' | 'profile' | 'project' | 'job',
  title: string,
  platformMetadata: Record<string, unknown> = {},
) {
  return {
    id,
    platform: type === 'profile' ? 'gaddr' : type === 'project' || type === 'job' ? 'gaddr-jobs' : 'youtube',
    externalId: id,
    type,
    subType: type,
    title,
    description: `${title} description`,
    thumbnailUrl: '',
    mediaUrl: '',
    creatorName: type === 'profile' ? title : 'Search creator',
    creatorAvatar: '',
    publishedAt: '2026-08-01T10:00:00.000Z',
    engagement: {},
    score: 1,
    rank: 1,
    platformMetadata,
  }
}

async function stubFlatSearch(page: Page) {
  const terms: string[] = []

  await page.route(
    (url) => url.pathname.endsWith('/search'),
    async (route) => {
      const body = (route.request().postDataJSON() ?? {}) as SearchRequest
      const term = body.searchTerm ?? ''
      terms.push(term)

      const items = term === 'Kittens'
        ? [item('kitten-video', 'content', 'Kittens playing together')]
        : [
            item('profile-1', 'profile', 'Ada Lovelace', {
              id: 'profile-1',
              firstName: 'Ada',
              lastName: 'Lovelace',
              userName: 'ada',
              followersCount: 120,
            }),
            item('content-1', 'content', 'Design systems explained', {
              sourceUrl: 'https://youtube.example/design',
            }),
            item('101', 'project', 'Build a component library', {
              budget: '5000',
              currency: 'USD',
              status: 'open',
              skills: ['React'],
            }),
            item('job-1', 'job', 'Frontend engineer', {
              jobType: 'full-time',
              status: 'published',
              sourceUrl: 'https://jobs.example/frontend',
            }),
          ]

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          query: term,
          items,
          pagination: {
            page: 1,
            limit: 12,
            total: items.length,
            hasMore: false,
          },
          facets: {
            content: items.filter((entry) => entry.type === 'content').length,
            profile: items.filter((entry) => entry.type === 'profile').length,
            project: items.filter((entry) => entry.type === 'project').length,
            job: items.filter((entry) => entry.type === 'job').length,
          },
        }),
      })
    },
  )

  return terms
}

test.describe('search result interactions', () => {
  test('a related query click loads that query\'s results', async ({ page }) => {
    const terms = await stubFlatSearch(page)
    await page.goto('/discover?q=design')
    await expect(page.getByText('Design systems explained')).toBeVisible({
      timeout: 30_000,
    })

    await page.getByRole('button', { name: 'Kittens', exact: true }).click()

    await expect(page).toHaveURL(/\/discover\?q=Kittens$/)
    await expect.poll(() => terms).toContain('Kittens')
    await expect(page.getByText('Kittens playing together')).toBeVisible()
  })

  test('the All tab grid uses each result type\'s card', async ({ page }) => {
    await stubFlatSearch(page)
    await page.goto('/discover?q=design')

    await expect(page.getByTestId('search-result-card')).toHaveCount(4, {
      timeout: 30_000,
    })
    for (const type of ['profile', 'content', 'project', 'job']) {
      await expect(
        page.locator(`[data-testid="search-result-card"][data-result-type="${type}"]`),
      ).toHaveCount(1)
    }

    await page.getByTestId('results-list-view').click()
    await expect(page.getByTestId('classic-serp-result')).toHaveCount(4)

    await page.getByTestId('results-grid-view').click()
    await expect(page.getByTestId('classic-serp-result')).toHaveCount(0)
    await expect(page.getByTestId('search-result-card')).toHaveCount(4)
  })
})
