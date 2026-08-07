import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * `.svg` as a React component, the way the app sees it.
 *
 * Next builds these through `@svgr/webpack` (see next.config.ts), so every
 * `import Icon from '@/components/svg/x.svg'` is a *component*. Vite's default
 * asset handling makes it a URL string instead, and rendering a string as a
 * component throws `InvalidCharacterError: … did not match the Name production`
 * — an error that reads like a DOM bug rather than a missing transform.
 *
 * Rather than mock the icons away, this keeps the real markup: the file's own
 * inner content is mounted and props (className, aria-hidden, …) still spread
 * onto the root, so a test can assert on what an icon actually renders.
 */
function svgAsReactComponent(): Plugin {
  return {
    name: 'svg-as-react-component',
    enforce: 'pre',
    load(id) {
      const file = id.split('?')[0]
      if (!file.endsWith('.svg')) return null

      const raw = readFileSync(file, 'utf8')
      const openTag = /<svg([^>]*)>/.exec(raw)
      const inner = openTag
        ? raw.slice(openTag.index + openTag[0].length).replace(/<\/svg>\s*$/, '')
        : ''
      const viewBox = /viewBox="([^"]*)"/.exec(openTag?.[1] ?? '')?.[1] ?? '0 0 24 24'

      return [
        `import * as React from 'react'`,
        `const Svg = (props) => React.createElement('svg', {`,
        `  viewBox: ${JSON.stringify(viewBox)},`,
        `  xmlns: 'http://www.w3.org/2000/svg',`,
        `  ...props,`,
        `  dangerouslySetInnerHTML: { __html: ${JSON.stringify(inner)} },`,
        `})`,
        `Svg.displayName = ${JSON.stringify(file.split('/').pop())}`,
        `export default Svg`,
        `export const ReactComponent = Svg`,
      ].join('\n')
    },
  }
}

/**
 * Vitest configuration.
 *
 * Vitest rather than Jest: this project is Vite-adjacent, ESM-first, and Vitest needs
 * no separate transform config to handle TypeScript and JSX. It also starts fast
 * enough to run in a pre-push gate.
 *
 * `resolve.tsconfigPaths` makes `@/*` resolve exactly as it does in the app, so tests
 * import real modules instead of relative-path guesses. Vite supports this natively;
 * the vite-tsconfig-paths plugin is not needed.
 */
export default defineConfig({
  plugins: [svgAsReactComponent(), react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    // jsdom defaults to the opaque origin "about:blank", where the Storage API is
    // unavailable — `localStorage` is undefined and any access throws. Giving it a
    // real origin is what makes localStorage/sessionStorage work, which most of this
    // app's client code touches.
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000' },
    },
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Vitest defaults to 5 s, which is generous for these tests on an idle
    // machine and far too tight on a busy one. When another agent session was
    // compiling in the same checkout, five ordinary tests failed with
    // "Test timed out in 5000ms" while the same run passed on a quiet machine —
    // a red gate that says nothing about the code. Raised so contention cannot
    // fake a failure; a genuinely hung test still fails, just later.
    testTimeout: 20_000,
    hookTimeout: 20_000,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    // Fail rather than silently pass when a filter matches nothing — a green run
    // that executed zero tests is worse than a red one.
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/components/svg/**',
        '**/*.{test,spec}.{ts,tsx}',
      ],
    },
  },
})
