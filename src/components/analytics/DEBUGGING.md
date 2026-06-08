# Debugging Token Refresh Analytics

## ❌ Error: `window.__gaddr_analytics is undefined`

This error occurs when the analytics module hasn't been initialized yet. This is fixed automatically by the `TokenRefreshAnalytics` component.

**Solution:**
1. Ensure the `<TokenRefreshAnalytics />` component is in your layout
2. Refresh the page
3. The component will auto-initialize the debug tools

**Manual initialization** (if needed):
```javascript
// Import and call this in your app
import { initializeAnalyticsDebugTools } from '@/utils/analytics.util';
initializeAnalyticsDebugTools();
```

## The analytics window shows no stats

This is normal when you first load the app. The analytics only show data **after** a token refresh has occurred.

### Quick Test

Open the browser console and run:

```javascript
// Add a test metric to verify the analytics are working
window.__gaddr_analytics.addTestMetric()
```

The analytics window should immediately update with the test data.

### How to Trigger Real Token Refresh

1. **Wait for automatic refresh** - Token refreshes automatically when it's about to expire (within 5 minutes)

2. **Force a refresh via server header** - Your backend can send the `X-Token-Refresh-Required: true` header

3. **Log out and back in** - This will create a new token and you'll see the refresh on next request

4. **Wait for app initialization** - On first load, the app checks token status and may refresh if needed

### Debug Commands

```javascript
// Check if any metrics exist
window.__gaddr_analytics.getRawMetrics()

// Get formatted stats
window.__gaddr_analytics.getStats()

// Add multiple test metrics
for(let i=0; i<10; i++) window.__gaddr_analytics.addTestMetric()

// Clear all metrics
window.__gaddr_analytics.clearMetrics()
```

### Check Console Logs

In development mode, you should see console logs like:

```
[Analytics] Debug tools available at window.__gaddr_analytics
[TokenRefresh] Initializing token refresh...
[Analytics] Token Refresh Tracked: { duration: '342ms', success: true, ... }
```

If you're **not seeing** these logs:
1. Check that `NODE_ENV` is set to `development`
2. Ensure you're running the dev server (not a production build)
3. Verify the analytics component is in your layout

### Component Placement

The analytics component should be in your root layout:

```tsx
// src/app/layout.tsx
import { TokenRefreshAnalytics } from '@/components/analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <TokenRefreshAnalytics /> {/* Should be here */}
      </body>
    </html>
  );
}
```

### Button States

- **Gray button** = No data yet (waiting for first refresh)
- **Purple button** = Has data
- **Badge on button** = Number shows total refresh count

### Expected Behavior

1. App loads → Analytics button appears (gray)
2. Click button → Shows "No data yet" message
3. Token refresh occurs → Console log appears
4. Button turns purple with count badge
5. Click button → Shows actual stats

### Still Not Working?

1. Open browser console
2. Run: `window.__gaddr_analytics.addTestMetric()`
3. If button doesn't turn purple → React state issue
4. If button turns purple but no stats → Component rendering issue
5. Check for console errors

### Manual Testing Steps

```javascript
// 1. Clear existing data
window.__gaddr_analytics.clearMetrics()

// 2. Add test data
window.__gaddr_analytics.addTestMetric()
window.__gaddr_analytics.addTestMetric()
window.__gaddr_analytics.addTestMetric()

// 3. Check stats
window.__gaddr_analytics.getStats()

// Should return:
// {
//   tokenRefresh: { total: 3, successful: 2-3, ... },
//   performance: null
// }
```

### Performance Metrics

Performance metrics are tracked automatically for:
- `token_refresh` - Full refresh operation
- `refresh_token_action` - Server action call

These will appear after token refreshes occur.
