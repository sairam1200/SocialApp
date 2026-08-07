import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  COLOR_SCHEME_STORAGE_KEY,
  ColorSchemeProvider,
  colorSchemeInitScript,
  useColorScheme,
} from './ColorSchemeProvider'
import { emitColorSchemeChange, mockMatchMedia } from '../../vitest.setup'

/**
 * Dark mode was unreachable before this provider existed: globals.css defined a
 * complete `.dark` token block, but nothing ever put the class on <html>.
 *
 * These tests pin the three things that make it actually usable — the class is
 * applied, the choice persists, and "system" tracks the OS — plus the anti-flash
 * script, which is the difference between working dark mode and dark mode that blinks
 * white on every page load.
 */

function Probe() {
  const { colorScheme, resolvedColorScheme, setColorScheme, toggleColorScheme } =
    useColorScheme()

  return (
    <div>
      <span data-testid="preference">{colorScheme}</span>
      <span data-testid="resolved">{resolvedColorScheme}</span>
      <button onClick={() => setColorScheme('dark')}>set dark</button>
      <button onClick={() => setColorScheme('light')}>set light</button>
      <button onClick={() => setColorScheme('system')}>set system</button>
      <button onClick={toggleColorScheme}>cycle</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <ColorSchemeProvider>
      <Probe />
    </ColorSchemeProvider>,
  )
}

describe('ColorSchemeProvider', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
    mockMatchMedia(false) // OS prefers light unless a test says otherwise
  })

  it('defaults to following the system', async () => {
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('preference')).toHaveTextContent('system'),
    )
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
  })

  it('resolves to dark when the OS prefers dark', async () => {
    mockMatchMedia(true)
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('resolved')).toHaveTextContent('dark'),
    )
  })

  it('adds the dark class to <html> — the mechanism the tokens key off', async () => {
    renderProvider()
    await userEvent.click(await screen.findByText('set dark'))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes the dark class when switching back to light', async () => {
    renderProvider()

    await userEvent.click(await screen.findByText('set dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await userEvent.click(screen.getByText('set light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('sets style.colorScheme so native controls and scrollbars match', async () => {
    // Without this, form controls and scrollbars stay light inside a dark page.
    renderProvider()

    await userEvent.click(await screen.findByText('set dark'))
    expect(document.documentElement.style.colorScheme).toBe('dark')

    await userEvent.click(screen.getByText('set light'))
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('persists the choice so it survives a reload', async () => {
    renderProvider()
    await userEvent.click(await screen.findByText('set dark'))

    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark')
  })

  it('restores a stored preference on mount', async () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark')
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('preference')).toHaveTextContent('dark'),
    )
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('ignores a corrupt stored value rather than breaking', async () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'chartreuse')
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('preference')).toHaveTextContent('system'),
    )
  })

  it('cycles light -> dark -> system', async () => {
    renderProvider()

    await userEvent.click(await screen.findByText('set light'))
    expect(screen.getByTestId('preference')).toHaveTextContent('light')

    await userEvent.click(screen.getByText('cycle'))
    expect(screen.getByTestId('preference')).toHaveTextContent('dark')

    await userEvent.click(screen.getByText('cycle'))
    expect(screen.getByTestId('preference')).toHaveTextContent('system')

    await userEvent.click(screen.getByText('cycle'))
    expect(screen.getByTestId('preference')).toHaveTextContent('light')
  })

  it('follows a live OS change while set to system', async () => {
    mockMatchMedia(false)
    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId('resolved')).toHaveTextContent('light'),
    )

    // Simulate the user switching their OS to dark mode mid-session.
    emitColorSchemeChange(true)

    await waitFor(() =>
      expect(document.documentElement.classList.contains('dark')).toBe(true),
    )
  })

  it('stops following the OS once an explicit choice is made', async () => {
    mockMatchMedia(false)
    renderProvider()

    await userEvent.click(await screen.findByText('set light'))

    // An OS change must not override an explicit preference.
    emitColorSchemeChange(true)

    await waitFor(() =>
      expect(screen.getByTestId('resolved')).toHaveTextContent('light'),
    )
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('throws a useful error when used outside the provider', () => {
    // A silent undefined context would surface as a confusing crash deep in a child.
    expect(() => render(<Probe />)).toThrow(/must be used within a ColorSchemeProvider/)
  })
})

describe('colorSchemeInitScript', () => {
  it('reads the same storage key the provider writes', () => {
    // If these drift, the pre-paint script applies a different theme than the
    // provider settles on — a guaranteed flash.
    expect(colorSchemeInitScript).toContain(COLOR_SCHEME_STORAGE_KEY)
  })

  it('is synchronous and dependency-free so it runs before first paint', () => {
    expect(colorSchemeInitScript).not.toMatch(/\bimport\b|\brequire\(|await /)
  })

  it('is wrapped in try/catch — localStorage throws in Safari private mode', () => {
    expect(colorSchemeInitScript).toContain('try')
    expect(colorSchemeInitScript).toContain('catch')
  })

  it('applies the dark class when it executes with a dark preference', () => {
    // Executes the real script the way the browser would, rather than asserting on
    // its text. This is what prevents the flash of the wrong theme.
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark')
    document.documentElement.classList.remove('dark')

    new Function(colorSchemeInitScript)()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('leaves the class off for a light preference', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'light')
    document.documentElement.classList.add('dark')

    new Function(colorSchemeInitScript)()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('treats an unrecognised stored value as system', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'nonsense')
    mockMatchMedia(true)
    document.documentElement.classList.remove('dark')

    new Function(colorSchemeInitScript)()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
