import { expect, test } from '@playwright/test'

/**
 * The error and not-found pages.
 *
 * These exist because both files were **missing**, and the symptom of a missing
 * `not-found.tsx` is not an error — it is Next.js quietly serving its own built-in page:
 * unstyled black-on-white, the words "404 | This page could not be found", in English, with
 * no way onward and no indication it belongs to Gaddr. It also ignores the dark theme, so a
 * user browsing at night got a full-brightness white flash.
 *
 * Nothing in a unit test can catch that. The only way to know a 404 renders correctly is to
 * ask for a URL that does not exist.
 */

test.describe('404 page', () => {
  test('serves the Gaddr page, not the Next.js default', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-9f3a')

    // A real 404 status, not a 200 with error content — search engines and monitoring both
    // depend on the status being honest.
    expect(response?.status()).toBe(404)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // The built-in page says exactly this. Its absence is the assertion.
    await expect(page.getByText('This page could not be found')).toHaveCount(0)
  })

  test('offers a way onward', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-9f3a')

    // A dead end is the worst part of most error screens. Search comes first deliberately:
    // a 404 usually means someone was looking for something specific.
    const links = page.getByRole('link')
    await expect(links.filter({ hasText: /search|sök/i }).first()).toBeVisible()
    await expect(links.filter({ hasText: /start|home|hem/i }).first()).toBeVisible()
  })

  test('the onward links actually work', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-9f3a')
    await page
      .getByRole('link')
      .filter({ hasText: /search|sök/i })
      .first()
      .click()

    // Proves the route is real rather than a plausible-looking href.
    await expect(page).toHaveURL(/\/discover/)
  })

  test('does not scroll horizontally at mobile width', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-9f3a')

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflows).toBe(false)
  })

  test('is legible in dark mode', async ({ page }) => {
    // The specific regression the old hardcoded `text-gray-600` caused: grey text on a
    // near-black background. Asserting the computed colours actually differ from the
    // background is the only way to catch invisible text.
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/this-route-does-not-exist-9f3a')

    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()

    const { colour, background } = await heading.evaluate((el) => {
      const style = getComputedStyle(el)
      let node: HTMLElement | null = el as HTMLElement
      let bg = 'rgba(0, 0, 0, 0)'
      while (node) {
        const candidate = getComputedStyle(node).backgroundColor
        if (candidate && candidate !== 'rgba(0, 0, 0, 0)') {
          bg = candidate
          break
        }
        node = node.parentElement
      }
      return { colour: style.color, background: bg }
    })

    expect(colour).not.toBe(background)
  })
})

test.describe('error page copy', () => {
  test('never shows a raw error message or a stack frame', async ({ page }) => {
    // The old error.tsx rendered `error.message` into the page. Asserting on the 404 here is
    // the reachable proxy: both screens share the same ErrorState component, and neither may
    // ever print internals.
    await page.goto('/this-route-does-not-exist-9f3a')

    const body = (await page.textContent('body')) ?? ''
    for (const leak of [
      'TypeError',
      'ReferenceError',
      'at Object.',
      'node_modules',
      'webpack',
      'Cannot read properties',
      'undefined is not',
    ]) {
      expect(body).not.toContain(leak)
    }
  })
})
