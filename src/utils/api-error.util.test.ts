import { describe, expect, it } from 'vitest'
import { apiErrorMessage, parseApiError } from './api-error.util'
import type { ApiError } from '@/types/error.types'

/**
 * Turning a failed request into copy for a person.
 *
 * The previous implementation returned `data.title || data.message || error.message` — so
 * whatever the backend or axios happened to say went straight onto the screen. These tests
 * pin the two things that fixed:
 *
 * - axios's own strings ("Network Error", "timeout of 8000ms exceeded", "Request failed with
 *   status code 500") never reach a user
 * - a 5xx message is never shown, because a server fault is not the user's to interpret,
 *   and the backend has 201 endpoints — there is no way to audit every message it might emit
 */

function apiError(
  status: number | undefined,
  data?: unknown,
  message = 'Request failed',
): ApiError {
  return {
    message,
    ...(status === undefined ? {} : { response: { status, data } }),
  } as ApiError
}

/** Stand-in for the `errors` namespace translator. */
const t = (key: string) => `t:${key}`

describe('status mapping', () => {
  it('maps each status the UI needs to distinguish', () => {
    expect(parseApiError(apiError(401)).key).toBe('unauthorized')
    expect(parseApiError(apiError(403)).key).toBe('forbidden')
    expect(parseApiError(apiError(404)).key).toBe('notFound')
    expect(parseApiError(apiError(429)).key).toBe('rateLimited')
    expect(parseApiError(apiError(500)).key).toBe('generic')
    expect(parseApiError(apiError(503)).key).toBe('generic')
  })

  it('treats a missing response as a network problem, not a generic error', () => {
    // No response at all means the request never landed — a connection or DNS failure. Telling
    // the user to check their connection is actionable; "something went wrong" is not.
    expect(parseApiError(apiError(undefined)).key).toBe('network')
  })

  it('survives a null or undefined error', () => {
    expect(parseApiError(null).key).toBe('generic')
    expect(parseApiError(undefined).key).toBe('generic')
  })

  it('keeps the status so callers can branch on it', () => {
    // Needed for things copy cannot express — redirecting to login on a 401.
    expect(parseApiError(apiError(401)).status).toBe(401)
  })
})

describe('when the server message is shown', () => {
  it('passes through a 4xx explanation, which is more useful than generic copy', () => {
    const parsed = parseApiError(
      apiError(409, { title: 'That username is already taken' }),
    )
    expect(parsed.detail).toBe('That username is already taken')
  })

  it('accepts a plain string body', () => {
    expect(parseApiError(apiError(400, 'Your password is too short')).detail).toBe(
      'Your password is too short',
    )
  })

  it('NEVER passes through a 5xx message', () => {
    // The important one. A server fault is not the user's to interpret, and this is where
    // internals leak from.
    for (const status of [500, 502, 503, 504]) {
      expect(
        parseApiError(apiError(status, { title: 'Connection terminated unexpectedly' }))
          .detail,
      ).toBeUndefined()
    }
  })

  it('never passes through axios own wording', () => {
    // These reached users verbatim before. None of them tells a person what to do.
    for (const message of [
      'Network Error',
      'timeout of 8000ms exceeded',
      'Request failed with status code 500',
    ]) {
      expect(parseApiError(apiError(undefined, undefined, message)).detail).toBeUndefined()
    }
  })
})

describe('leak detection on 4xx text', () => {
  const leaks = [
    ['a stack frame', 'TypeError: at SearchService.searchAsync (/app/dist/x.js:12)'],
    ['SQL', 'error: SELECT id, title FROM "contentStreams" WHERE platform = $1'],
    ['a connection code', 'connect ECONNREFUSED 10.0.0.5:5432'],
    ['a TypeORM error name', 'QueryFailedError: relation "userRoles" already exists'],
    ['a filesystem path', 'Cannot find module /app/dist/infrastructure/x.js'],
    ['a node_modules path', 'at Object.<anonymous> (node_modules/pg/lib/client.js:1)'],
    ['an undefined-property message', "undefined is not a function"],
  ] as const

  it.each(leaks)('suppresses %s', (_label, text) => {
    expect(parseApiError(apiError(400, { title: text })).detail).toBeUndefined()
  })

  it('suppresses anything implausibly long for a user-facing sentence', () => {
    const wall = 'x'.repeat(201)
    expect(parseApiError(apiError(400, { title: wall })).detail).toBeUndefined()
  })

  it('still allows ordinary prose that merely looks technical', () => {
    // The heuristics must not be so eager that legitimate messages get swallowed.
    for (const ok of [
      'That email is already registered',
      'Your session expired — please log in again',
      'Choose a username between 3 and 20 characters',
      'File must be a PNG or JPEG under 5 MB',
    ]) {
      expect(parseApiError(apiError(422, { title: ok })).detail).toBe(ok)
    }
  })

  it('suppresses an empty or whitespace-only message', () => {
    expect(parseApiError(apiError(400, { title: '   ' })).detail).toBeUndefined()
    expect(parseApiError(apiError(400, { title: '' })).detail).toBeUndefined()
  })
})

describe('apiErrorMessage', () => {
  it('prefers a safe server message over generic copy', () => {
    const parsed = parseApiError(apiError(409, { title: 'Username taken' }))
    expect(apiErrorMessage(parsed, t)).toBe('Username taken')
  })

  it('combines the translated title and hint when there is no server message', () => {
    expect(apiErrorMessage(parseApiError(apiError(undefined)), t)).toBe(
      't:network. t:networkHint',
    )
  })

  it('omits the hint for keys that have none', () => {
    // 401 and 403 are single-sentence messages in the namespace; appending "undefined" or a
    // missing-key marker would be worse than saying less.
    expect(apiErrorMessage(parseApiError(apiError(401)), t)).toBe('t:unauthorized')
    expect(apiErrorMessage(parseApiError(apiError(403)), t)).toBe('t:forbidden')
  })

  it('always returns something displayable', () => {
    expect(apiErrorMessage(parseApiError(null), t)).toBe('t:generic. t:genericHint')
  })
})
