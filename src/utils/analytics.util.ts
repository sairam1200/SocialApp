/**
 * Analytics utility for tracking application metrics
 * Provides performance tracking and event logging
 */

export interface TokenRefreshMetrics {
  duration: number;
  success: boolean;
  reason?: 'expired' | 'expiring_soon' | 'header_trigger' | 'manual';
  error?: string;
  timestamp: number;
  deviceId?: string;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

// In-memory storage for metrics (consider persisting to localStorage or sending to analytics service)
const metrics: {
  tokenRefresh: TokenRefreshMetrics[];
  performance: PerformanceMetrics[];
} = {
  tokenRefresh: [],
  performance: [],
};

const MAX_METRICS_STORAGE = 100; // Keep last 100 metrics

/**
 * Track token refresh metrics
 */
export function trackTokenRefresh(metricsInput: Omit<TokenRefreshMetrics, 'timestamp'>): void {
  const metric: TokenRefreshMetrics = {
    ...metricsInput,
    timestamp: Date.now(),
  };

  // Store in memory
  if (typeof window !== 'undefined') {
    addMetric('tokenRefresh', metric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] ✅ Token Refresh Tracked:', {
        duration: `${metric.duration}ms`,
        success: metric.success,
        reason: metric.reason,
        error: metric.error,
        totalMetrics: getMetricsCount(),
      });
      console.log('[Analytics] Current metrics store:', metrics);
    }

    // Send to analytics service (replace with your analytics provider)
    sendToAnalytics('token_refresh', metric);
  } else {
    console.warn('[Analytics] ⚠️ Tracking called on server-side, skipping');
  }
}

/**
 * Track general performance metrics
 */
export function trackPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  const metric: PerformanceMetrics = {
    operation,
    duration,
    metadata,
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    addMetric('performance', metric);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Performance [${operation}]:`, `${duration}ms`, metadata);
    }

    sendToAnalytics('performance', metric);
  }
}

/**
 * Performance timer utility
 */
export class PerformanceTimer {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = performance.now();
  }

  end(metadata?: Record<string, unknown>): number {
    const duration = Math.round(performance.now() - this.startTime);
    trackPerformance(this.operation, duration, metadata);
    return duration;
  }

  endWith<T>(result: T, metadata?: Record<string, unknown>): T {
    this.end(metadata);
    return result;
  }
}

/**
 * Async function wrapper with performance tracking
 */
export async function trackAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const timer = new PerformanceTimer(operation);
  try {
    const result = await fn();
    timer.end({ ...metadata, success: true });
    return result;
  } catch (error) {
    timer.end({ ...metadata, success: false, error: String(error) });
    throw error;
  }
}

/**
 * Add metric to storage with size limit
 */
function addMetric<T extends TokenRefreshMetrics | PerformanceMetrics>(
  type: keyof typeof metrics,
  metric: T
): void {
  (metrics[type] as T[]).push(metric);
  
  // Keep only the last MAX_METRICS_STORAGE entries
  if (metrics[type].length > MAX_METRICS_STORAGE) {
    metrics[type].shift();
  }
}

/**
 * Send metrics to analytics service
 * Replace this with your actual analytics provider (PostHog, Amplitude, etc.)
 */
function sendToAnalytics(
  // Uncomment when implementing analytics integration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _event: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _data: TokenRefreshMetrics | PerformanceMetrics
): void {
  // Example: Send to your analytics service
  // if (window.analytics) {
  //   window.analytics.track(event, data);
  // }

  // Example: Send to PostHog
  // if (window.posthog) {
  //   window.posthog.capture(event, data);
  // }

  // Example: Send to Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', event, data);
  // }

  // For now, just store locally
  // You can also send to your backend API
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true') {
    // TODO: Implement your analytics service integration here
    // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event, data }) })
  }
}

/**
 * Get token refresh statistics
 */
export function getTokenRefreshStats() {
  const refreshMetrics = metrics.tokenRefresh;
  
  if (refreshMetrics.length === 0) {
    return null;
  }

  const successful = refreshMetrics.filter(m => m.success);
  const failed = refreshMetrics.filter(m => !m.success);

  const avgDuration = successful.reduce((sum, m) => sum + m.duration, 0) / successful.length || 0;
  const minDuration = Math.min(...successful.map(m => m.duration));
  const maxDuration = Math.max(...successful.map(m => m.duration));

  return {
    total: refreshMetrics.length,
    successful: successful.length,
    failed: failed.length,
    successRate: (successful.length / refreshMetrics.length) * 100,
    avgDuration: Math.round(avgDuration),
    minDuration: isFinite(minDuration) ? minDuration : 0,
    maxDuration: isFinite(maxDuration) ? maxDuration : 0,
    recentRefreshes: refreshMetrics.slice(-10),
  };
}

/**
 * Get all performance metrics
 */
export function getPerformanceStats() {
  const perfMetrics = metrics.performance;
  
  if (perfMetrics.length === 0) {
    return null;
  }

  const byOperation: Record<string, { count: number; avgDuration: number; total: number }> = {};

  perfMetrics.forEach(m => {
    if (!byOperation[m.operation]) {
      byOperation[m.operation] = { count: 0, avgDuration: 0, total: 0 };
    }
    byOperation[m.operation].count++;
    byOperation[m.operation].total += m.duration;
  });

  Object.keys(byOperation).forEach(op => {
    byOperation[op].avgDuration = Math.round(byOperation[op].total / byOperation[op].count);
  });

  return byOperation;
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics.tokenRefresh = [];
  metrics.performance = [];
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] All metrics cleared');
  }
}

/**
 * Get metrics count for debugging
 */
function getMetricsCount() {
  return {
    tokenRefresh: metrics.tokenRefresh.length,
    performance: metrics.performance.length,
  };
}

/**
 * Export metrics for debugging or reporting
 */
export function exportMetrics() {
  return {
    tokenRefresh: getTokenRefreshStats(),
    performance: getPerformanceStats(),
    raw: metrics,
  };
}

/**
 * Initialize analytics debug tools on window (client-side only)
 */
export function initializeAnalyticsDebugTools(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Check if already initialized
  const win = window as Window & { __gaddr_analytics?: unknown };
  if (win.__gaddr_analytics) {
    return;
  }

  win.__gaddr_analytics = {
    getStats: exportMetrics,
    getTokenRefreshStats,
    getPerformanceStats,
    clearMetrics,
    // Test functions for debugging
    addTestMetric: () => {
      const reasons: Array<'expired' | 'expiring_soon' | 'header_trigger' | 'manual'> = ['expired', 'expiring_soon', 'header_trigger', 'manual'];
      trackTokenRefresh({
        duration: Math.floor(Math.random() * 500) + 200,
        success: Math.random() > 0.2,
        reason: reasons[Math.floor(Math.random() * 4)],
        deviceId: 'test-device',
      });
      console.log('[Analytics] Test metric added. Total metrics:', getMetricsCount());
    },
    getRawMetrics: () => metrics,
  };
  
  console.log('[Analytics] Debug tools available at window.__gaddr_analytics');
  console.log('  - getStats() - Get all statistics');
  console.log('  - addTestMetric() - Add a random test metric');
  console.log('  - clearMetrics() - Clear all metrics');
  console.log('  - getRawMetrics() - Get raw metrics data');
}

// Auto-initialize on module load (client-side)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  initializeAnalyticsDebugTools();
}
