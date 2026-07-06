"use client";

import { useWebSocket } from "@/contexts/WebSocketContext";
import { useSessionSecurity } from "@/hooks/useSessionSecurity";
import { useNotifications } from "@/hooks/useNotifications";
import { useImports } from "@/hooks/useImports";
import { useFollowSocket } from "@/hooks/useFollowSocket";

export default function WebSocketStatus() {
    const { isNotificationsConnected, isImportsConnected } = useWebSocket();
    const { isConnected: sessionSecurityConnected } = useSessionSecurity();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { recentImports } = useImports();
    useFollowSocket();

    const overallConnected = isNotificationsConnected && isImportsConnected;

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">🔌 WebSocket Status</h3>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${overallConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-xs font-medium">
                        {overallConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <div className="space-y-1 text-xs mb-3">
                <div className="flex items-center gap-2">
                    <span className={isNotificationsConnected ? "text-green-600" : "text-red-600"}>
                        {isNotificationsConnected ? "🟢" : "🔴"}
                    </span>
                    <span>Notifications</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={isImportsConnected ? "text-green-600" : "text-red-600"}>
                        {isImportsConnected ? "🟢" : "🔴"}
                    </span>
                    <span>Imports</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={sessionSecurityConnected ? "text-green-600" : "text-red-600"}>
                        {sessionSecurityConnected ? "🟢" : "🔴"}
                    </span>
                    <span>Session Security</span>
                </div>
            </div>

            {/* Notifications */}
            <div className="border-t pt-2 mb-2">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold">
                        Notifications: {unreadCount} unread
                    </p>
                    {notifications.length > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500">No notifications</p>
                ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {notifications.slice(0, 3).map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`text-xs p-2 rounded cursor-pointer ${notif.isRead ? "bg-gray-50" : "bg-blue-50"
                                    }`}
                            >
                                <p className="font-medium">{notif.title}</p>
                                <p className="text-gray-600 truncate">{notif.body}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Imports */}
            <div className="border-t pt-2">
                <p className="text-xs font-semibold mb-1">
                    Recent Imports: {recentImports.length}
                </p>
                {recentImports.length === 0 ? (
                    <p className="text-xs text-gray-500">No imports yet</p>
                ) : (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                        {recentImports.slice(0, 3).map((imp, i) => (
                            <div key={i} className="text-xs p-1 bg-gray-50 rounded">
                                <span className="font-medium">{imp.platform}</span>
                                {imp.title && (
                                    <span className="text-gray-600">: {imp.title}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}