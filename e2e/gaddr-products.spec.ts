import { expect, test } from '@playwright/test'

async function stubCommunityShell(page: import('@playwright/test').Page) {
  await page.context().addCookies([
    {
      name: 'gaddr-locale',
      value: 'en',
      domain: 'localhost',
      path: '/',
    },
  ])
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
}

test.describe('Gaddr product navigation', () => {
  test('links what answers and labels the rest honestly', async ({ page }) => {
    await stubCommunityShell(page)
    await page.goto('/community')

    await page.locator('[data-testid="gaddr-product-switcher"]:visible').click()

    const products = page.locator('nav[aria-label="Gaddr products"]:visible')

    // The list is the shared platform contract, not a local array. These
    // assertions are about the two properties the contract guarantees, not
    // about which products happen to exist today: a row is a link only when
    // something answers at the other end, and a row that has no destination
    // still appears, labelled.
    await expect(products.getByRole('link', { name: /Gaddr Jobs/ })).toHaveAttribute(
      'href',
      'https://jobs.gaddr.com',
    )
    await expect(products.getByRole('link', { name: /Gaddr Code/ })).toHaveAttribute(
      'href',
      /^https:\/\//,
    )

    // Gaddr Work has no host yet. It is shown and marked, not hidden, and it
    // is not a link, because a link into a browser error page is worse than
    // an honest label.
    await expect(products.getByText('Gaddr Work')).toBeVisible()
    await expect(products.getByRole('link', { name: /Gaddr Work/ })).toHaveCount(0)
    await expect(products.getByText('Soon').first()).toBeVisible()

    // The incubator is its own group, and its products keep their own names.
    await expect(products.getByRole('link', { name: /NeurTask/ })).toHaveAttribute(
      'href',
      'https://neurtask.com',
    )
    await expect(products.getByText('CalcAios')).toBeVisible()
  })
})
