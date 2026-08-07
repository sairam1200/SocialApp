import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * Test environment bootstrap.
 *
 * jsdom does not implement several browser APIs this app relies on, and an
 * unimplemented API throws at import rather than at use — which surfaces as a
 * confusing "test suite failed to run" instead of a clear failure.
 */

/**
 * Storage polyfill.
 *
 * Node 22+ ships an experimental built-in `localStorage` that is only functional when
 * the process is started with `--localstorage-file`. Without that flag Node still
 * *declares* the global, and it shadows the implementation jsdom provides — so
 * `globalThis.localStorage` is `undefined` and every access throws
 * "Cannot read properties of undefined (reading 'setItem')".
 *
 * Rather than depend on Node's flag or on jsdom winning the name race, install a
 * minimal in-memory Storage. This keeps tests deterministic across Node versions,
 * which matters because CI and developer machines will not be on the same one.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    // Real Storage coerces both arguments to strings; tests should see that too.
    this.store.set(String(key), String(value))
  }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  const existing = (globalThis as Record<string, unknown>)[name]
  const usable =
    existing != null && typeof (existing as Storage).setItem === 'function'

  if (!usable) {
    const storage = new MemoryStorage()
    Object.defineProperty(globalThis, name, {
      value: storage,
      writable: true,
      configurable: true,
    })
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, name, {
        value: storage,
        writable: true,
        configurable: true,
      })
    }
  }
}

// Unmount React trees between tests so a leaked component cannot affect the next
// assertion. Without this, `getByRole` can match an element from a previous test.
afterEach(() => {
  cleanup()
  // Guarded: the Storage API is absent under an opaque origin. vitest.config.ts sets
  // a real jsdom URL so it is normally present, but a suite that overrides the
  // environment should not fail here for an unrelated reason.
  globalThis.localStorage?.clear()
  globalThis.sessionStorage?.clear()
  vi.restoreAllMocks()
})

beforeEach(() => {
  // matchMedia is missing in jsdom. ColorSchemeProvider calls it to resolve the
  // "system" colour scheme, so without this every test touching theme throws.
  // Defaults to light; override per test with mockMatchMedia below.
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(), // deprecated, but some libraries still call it
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }
})

/**
 * Force `prefers-color-scheme: dark` (or light) for a test.
 *
 * Returns the listener set so a test can simulate the user changing their OS setting
 * mid-session, which is what ColorSchemeProvider subscribes to.
 */
let prefersDarkFlag = false
const mediaListeners = new Set<(event: MediaQueryListEvent) => void>()

export function mockMatchMedia(prefersDark: boolean) {
  prefersDarkFlag = prefersDark

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      // A live getter, not a snapshot. ColorSchemeProvider calls matchMedia once and
      // keeps the returned MediaQueryList, reading `.matches` inside its change
      // handler. If this were a fixed boolean, simulating an OS theme change would
      // fire the listener but still report the old value — the test would fail
      // against correct code.
      get matches() {
        return query.includes('dark') ? prefersDarkFlag : !prefersDarkFlag
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) =>
        mediaListeners.add(cb),
      removeEventListener: (
        _: string,
        cb: (event: MediaQueryListEvent) => void,
      ) => mediaListeners.delete(cb),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  return mediaListeners
}

/** Simulate the user changing their OS colour scheme mid-session. */
export function emitColorSchemeChange(prefersDark: boolean) {
  prefersDarkFlag = prefersDark
  for (const listener of mediaListeners) {
    listener({ matches: prefersDark } as MediaQueryListEvent)
  }
}

// ResizeObserver is used by Radix primitives (Select, Popover) and is absent in jsdom.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// IntersectionObserver — used by lazy-loading and infinite-scroll components.
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    root = null
    rootMargin = ''
    thresholds: number[] = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}
