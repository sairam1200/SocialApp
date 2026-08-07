"use client";
import { useEffect, useState } from "react";
import { getTokenRefreshStats, getPerformanceStats, TokenRefreshMetrics, initializeAnalyticsDebugTools, trackTokenRefresh } from "@/utils/analytics.util";

interface TokenStats {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    recentRefreshes: TokenRefreshMetrics[];
}

interface PerfData {
    count: number;
    avgDuration: number;
    total: number;
}

/**
 * Development-only component to display token refresh analytics
 * Add this to your app layout in development mode to monitor performance
 */
export function TokenRefreshAnalytics() {
    const [stats, setStats] = useState<{ tokenStats: TokenStats | null; perfStats: Record<string, PerfData> | null } | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;

        // Initialize debug tools
        initializeAnalyticsDebugTools();

        // Initial load
        const updateStats = () => {
            const tokenStats = getTokenRefreshStats();
            const perfStats = getPerformanceStats();

            setStats({ tokenStats, perfStats });
        };

        updateStats(); // Run immediately

        const interval = setInterval(updateStats, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    // Only render in development
    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    const { tokenStats, perfStats } = stats || {};
    const hasData = tokenStats || perfStats;

    const handleAddTestMetric = () => {
        const reasons: Array<'expired' | 'expiring_soon' | 'header_trigger' | 'manual'> = ['expired', 'expiring_soon', 'header_trigger', 'manual'];
        trackTokenRefresh({
            duration: Math.floor(Math.random() * 500) + 200,
            success: Math.random() > 0.2,
            reason: reasons[Math.floor(Math.random() * 4)],
            deviceId: 'test-device',
        });
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${hasData ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-2 rounded-lg shadow-lg transition-colors font-mono text-sm flex items-center gap-2`}
            >
                📊 Token Analytics
                {hasData && tokenStats && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                        {tokenStats.total}
                    </span>
                )}
            </button>

            {isExpanded && (
                <div className="mt-2 bg-gray-900 text-white rounded-lg shadow-2xl p-4 w-96 max-h-96 overflow-auto font-mono text-xs">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                        <h3 className="font-bold text-sm">Token Refresh Analytics</h3>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {tokenStats && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-purple-400 mb-2">Token Refresh Stats</h4>
                            <div className="space-y-1 text-gray-300">
                                <div className="flex justify-between">
                                    <span>Total Refreshes:</span>
                                    <span className="font-bold text-white">{tokenStats.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Success Rate:</span>
                                    <span className={`font-bold ${tokenStats.successRate === 100 ? 'text-green-400' : tokenStats.successRate > 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {tokenStats.successRate.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Successful:</span>
                                    <span className="text-green-400 font-bold">{tokenStats.successful}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Failed:</span>
                                    <span className="text-red-400 font-bold">{tokenStats.failed}</span>
                                </div>
                                <div className="h-px bg-gray-700 my-2" />
                                <div className="flex justify-between">
                                    <span>Avg Duration:</span>
                                    <span className={`font-bold ${tokenStats.avgDuration < 500 ? 'text-green-400' : tokenStats.avgDuration < 1000 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {tokenStats.avgDuration}ms
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Min Duration:</span>
                                    <span className="text-green-400">{tokenStats.minDuration}ms</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Max Duration:</span>
                                    <span className="text-orange-400">{tokenStats.maxDuration}ms</span>
                                </div>
                            </div>

                            {tokenStats.recentRefreshes && tokenStats.recentRefreshes.length > 0 && (
                                <div className="mt-3">
                                    <h5 className="font-semibold text-purple-400 mb-1">Recent Activity</h5>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {tokenStats.recentRefreshes.slice().reverse().map((refresh: TokenRefreshMetrics, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`text-xs p-1.5 rounded ${refresh.success ? 'bg-green-900/30' : 'bg-red-900/30'}`}
                                            >
                                                <div className="flex justify-between">
                                                    <span className={refresh.success ? 'text-green-400' : 'text-red-400'}>
                                                        {refresh.success ? '✓' : '✗'} {refresh.reason}
                                                    </span>
                                                    <span className="text-gray-400">{refresh.duration}ms</span>
                                                </div>
                                                {refresh.error && (
                                                    <div className="text-red-300 text-[10px] mt-0.5">{refresh.error}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {perfStats && Object.keys(perfStats).length > 0 && (
                        <div>
                            <h4 className="font-semibold text-blue-400 mb-2">Performance Metrics</h4>
                            <div className="space-y-1.5">
                                {Object.entries(perfStats).map(([operation, data]: [string, PerfData]) => (
                                    <div key={operation} className="bg-gray-800/50 p-2 rounded">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300 text-[10px] uppercase">{operation.replace(/_/g, ' ')}</span>
                                            <span className={`font-bold ${data.avgDuration < 100 ? 'text-green-400' : data.avgDuration < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {data.avgDuration}ms
                                            </span>
                                        </div>
                                        <div className="text-gray-500 text-[10px] mt-0.5">
                                            {data.count} calls
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!tokenStats && !perfStats && (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">📊</div>
                            <div className="text-sm mb-1">No data yet</div>
                            <div className="text-xs text-gray-500 mb-3">
                                Token refresh metrics will appear here<br />
                                after the first refresh operation.
                            </div>
                            <button
                                onClick={handleAddTestMetric}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-xs transition-colors"
                            >
                                ➕ Add Test Metric
                            </button>
                            <div className="mt-3 text-xs bg-gray-800/50 p-2 rounded">
                                Or try logging out and back in to trigger a refresh
                            </div>
                        </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-gray-700 text-gray-500 text-[10px]">
                        💡 Console: <code>window.__gaddr_analytics.addTestMetric()</code>
                    </div>
                </div>
            )}
        </div>
    );
}
