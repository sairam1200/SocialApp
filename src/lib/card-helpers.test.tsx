import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  platformDisplayName,
  platformMonogram,
  renderPlatformIcon,
  renderLicenseAttribution,
} from './card-helpers'

/**
 * Source attribution on result cards.
 *
 * These tests exist because `renderPlatformIcon` used to `return null` for any platform
 * without a bundled brand SVG — which was four of the five platforms that actually
 * return data (GitHub, Apple, Openverse, Hacker News). Results rendered with no
 * indication of where they came from, which for an aggregation product reads as if Gaddr
 * wrote them.
 *
 * The licence half is a compliance requirement rather than a nicety: Openverse content
 * is worth using precisely because reuse rights are provable, and a CC-BY image rendered
 * without attribution breaches the licence that made it usable.
 */

describe('platformDisplayName', () => {
  it('uses the correct casing for platforms whose name is not a plain capitalisation', () => {
    expect(platformDisplayName('github')).toBe('GitHub')
    expect(platformDisplayName('youtube')).toBe('YouTube')
    expect(platformDisplayName('hackernews')).toBe('Hacker News')
    expect(platformDisplayName('tiktok')).toBe('TikTok')
    expect(platformDisplayName('linkedin')).toBe('LinkedIn')
  })

  it('title-cases anything it has never seen, so a new platform is never unlabelled', () => {
    // The whole point: adding a platform to the backend fan-out must not require a
    // frontend change before users can see where results came from.
    expect(platformDisplayName('mastodon')).toBe('Mastodon')
    expect(platformDisplayName('spotify')).toBe('Spotify')
  })

  it('normalises case and whitespace from the wire', () => {
    expect(platformDisplayName('  GitHub ')).toBe('GitHub')
    expect(platformDisplayName('OPENVERSE')).toBe('Openverse')
  })

  it('degrades to a readable string rather than an empty badge', () => {
    expect(platformDisplayName('')).toBe('Unknown source')
    expect(platformDisplayName('   ')).toBe('Unknown source')
  })
})

describe('platformMonogram', () => {
  it('uses initials for a multi-word source', () => {
    expect(platformMonogram('Hacker News')).toBe('HN')
  })

  it('uses the first two characters for a single-word source', () => {
    expect(platformMonogram('Openverse')).toBe('OP')
    expect(platformMonogram('Apple')).toBe('AP')
    expect(platformMonogram('GitHub')).toBe('GI')
  })

  it('never returns an empty badge', () => {
    expect(platformMonogram('')).toBe('?')
    expect(platformMonogram('   ')).toBe('?')
  })
})

describe('renderPlatformIcon', () => {
  it('renders a labelled badge for platforms with no brand mark', () => {
    // Regression net for the actual defect. Each of these returned null.
    for (const [platform, name] of [
      ['github', 'GitHub'],
      ['apple', 'Apple'],
      ['openverse', 'Openverse'],
      ['hackernews', 'Hacker News'],
    ] as const) {
      const { unmount } = render(<>{renderPlatformIcon(platform)}</>)
      // Queried by accessible name, not by text: the visible glyph is a monogram, and
      // what matters is that assistive tech announces the source in full.
      expect(screen.getByRole('img', { name })).toBeTruthy()
      unmount()
    }
  })

  it('still returns the brand mark where one exists', () => {
    // Inspected rather than rendered: the SVG loader resolves these to a data URI, which
    // jsdom cannot use as an element name. What matters here is only that platforms with
    // a real mark do not fall through to the monogram badge — so assert on the element.
    for (const platform of ['youtube', 'facebook', 'instagram', 'tiktok']) {
      const element = renderPlatformIcon(platform) as React.ReactElement<{
        role?: string
      }>

      expect(element).not.toBeNull()
      expect(element.props.role).toBeUndefined()
    }
  })

  it('labels an unrecognised platform instead of rendering nothing', () => {
    render(<>{renderPlatformIcon('mastodon')}</>)
    expect(screen.getByRole('img', { name: 'Mastodon' })).toBeTruthy()
  })
})

describe('renderLicenseAttribution', () => {
  it('shows the creator and a linked licence for openly-licensed media', () => {
    render(
      <>
        {renderLicenseAttribution({
          creator: 'Jonas Bergman',
          license: {
            code: 'by-sa',
            version: '4.0',
            url: 'https://creativecommons.org/licenses/by-sa/4.0/',
          },
        })}
      </>,
    )

    expect(screen.getByText('Jonas Bergman')).toBeTruthy()

    const link = screen.getByRole('link', { name: 'BY-SA 4.0' })
    expect(link.getAttribute('href')).toBe(
      'https://creativecommons.org/licenses/by-sa/4.0/',
    )
    // noreferrer as well as noopener: the deed link should not leak what the user searched.
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
  })

  it('renders the code without a version when the source gives none', () => {
    render(
      <>
        {renderLicenseAttribution({
          creator: null,
          license: { code: 'cc0', version: null, url: null },
        })}
      </>,
    )
    // 'by' alone still obliges attribution, so withholding the badge until a version
    // arrives would hide the obligation.
    expect(screen.getByText('CC0')).toBeTruthy()
  })

  it('renders nothing when the source stated no terms', () => {
    // Absent terms are NOT permissive terms. Every platform except Openverse lands here,
    // and implying reuse is allowed would be worse than showing nothing.
    for (const result of [
      { creator: 'Someone', license: null },
      { creator: null, license: undefined },
      { creator: null, license: { code: '', version: null, url: null } },
    ]) {
      const { container, unmount } = render(<>{renderLicenseAttribution(result)}</>)
      expect(container.textContent).toBe('')
      unmount()
    }
  })

  it('does not fabricate a link when the source gave no deed URL', () => {
    render(
      <>
        {renderLicenseAttribution({
          creator: 'Ada',
          license: { code: 'by', version: '3.0', url: null },
        })}
      </>,
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('BY 3.0')).toBeTruthy()
  })
})
