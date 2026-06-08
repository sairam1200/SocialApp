# Token Refresh Analytics

Development analytics for token/session refresh performance.

## What is tracked
- Token refresh attempts: success/failure, duration, reason, error.
- Performance operations currently emitted:
  - `token_refresh`
  - `refresh_token_action`
- Recent metrics retained in-memory.

## Rules for contributors
- New refresh/session metrics MUST be tracked through `src/utils/analytics.util.ts`.
- Analytics hooks SHOULD stay lightweight and non-blocking.
- UI diagnostics MUST remain development-only unless explicitly approved.

## Wiring
- Collection: `src/hooks/useTokenRefresh.ts`, `src/actions/token.actions.ts`
- Storage/debug API: `src/utils/analytics.util.ts`
- Dashboard UI: `src/components/analytics/TokenRefreshAnalytics.tsx`

## Console debug API (development)
```js
window.__gaddr_analytics.getStats()
window.__gaddr_analytics.getTokenRefreshStats()
window.__gaddr_analytics.getPerformanceStats()
window.__gaddr_analytics.clearMetrics()
window.__gaddr_analytics.addTestMetric()
window.__gaddr_analytics.getRawMetrics()
```

## Critical deviations
- Metrics are in-memory only and reset on page refresh.
- External analytics forwarding is still placeholder-gated by `NEXT_PUBLIC_ANALYTICS_ENABLED`.

## Shared checklists
Use the root README section `Shared checklists`.
