"use client";

import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import type {
    Notification,
    NotificationReadEvent,
    MarkAsReadSuccessEvent,
    MarkAllAsReadSuccessEvent,
} from "@/types/websocket.types";

export function useNotifications() {
    const { notificationsSocket, isNotificationsConnected } = useWebSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // listen for incoming notifications
    useEffect(() => {
        if (!notificationsSocket) return;

        const handleNewNotification = (notification: Notification) => {
            console.log("[Notifications] New notification:", notification);
            setNotifications((prev) => [notification, ...prev]);
            if (!notification.isRead) {
                setUnreadCount((prev) => prev + 1);
            }
        };

        const handleNotificationUpdated = (notification: Notification) => {
            console.log("[Notifications] Notification updated:", notification);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? notification : n))
            );
        };

        const handleNotificationRead = (data: NotificationReadEvent) => {
            console.log("[Notifications] Notifications marked as read:", data);

            if (data.notificationIds) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        data.notificationIds!.includes(n.id)
                            ? { ...n, isRead: true, readAt: data.readAt }
                            : n
                    )
                );
                setUnreadCount((prev) =>
                    Math.max(0, prev - data.notificationIds!.length)
                );
            }
        };

        notificationsSocket.on("new-notification", handleNewNotification);
        notificationsSocket.on("notification-updated", handleNotificationUpdated);
        notificationsSocket.on("notification-read", handleNotificationRead);

        return () => {
            notificationsSocket.off("new-notification", handleNewNotification);
            notificationsSocket.off(
                "notification-updated",
                handleNotificationUpdated
            );
            notificationsSocket.off("notification-read", handleNotificationRead);
        };
    }, [notificationsSocket]);


    const markAsRead = useCallback(
        (notificationId: string) => {
            if (!notificationsSocket || !isNotificationsConnected) {
                console.warn("[Notifications] Socket not connected");
                return;
            }

            notificationsSocket.emit("mark-as-read", { notificationId });

            notificationsSocket.once(
                "mark-as-read:success",
                (data: MarkAsReadSuccessEvent) => {
                    console.log("[Notifications] Mark as read success:", data);
                }
            );
        },
        [notificationsSocket, isNotificationsConnected]
    );

    const markAllAsRead = useCallback(() => {
        if (!notificationsSocket || !isNotificationsConnected) {
            console.warn("[Notifications] Socket not connected");
            return;
        }

        notificationsSocket.emit("mark-all-as-read", {});

        notificationsSocket.once(
            "mark-all-as-read:success",
            (data: MarkAllAsReadSuccessEvent) => {
                console.log("[Notifications] Mark all as read success:", data);
                setUnreadCount(0);
            }
        );
    }, [notificationsSocket, isNotificationsConnected]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isConnected: isNotificationsConnected,
    };
}
