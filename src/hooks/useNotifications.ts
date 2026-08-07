"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import toast from "react-hot-toast";
import type {
    Notification,
    NotificationReadEvent,
} from "@/types/websocket.types";

function showLifecycleNotification(notification: Notification, shownIds: Set<string>): void {
    const isImport = notification.type.toLowerCase() === "import";
    const status = notification.metaData?.status?.toLowerCase();
    const isTerminalImport = ["completed", "failed", "cancelled"].includes(status ?? "");

    // Import progress is delivered as updates to one notification. Do not
    // create a toast for every page/item; show one final success or error.
    if (isImport && !isTerminalImport) return;
    if (shownIds.has(notification.id)) return;
    shownIds.add(notification.id);

    const message = [notification.title, notification.body]
        .filter(Boolean)
        .join("\n");
    // A provider import can finish with per-item issues while still persisting
    // valid content. The backend reports that terminal state as `completed`,
    // so do not turn the informational message into an error toast.
    const isError = isImport
        ? ["failed", "cancelled"].includes(status ?? "")
        : /requires|failed|error|unavailable|expired|issue/i.test(message);

    if (isError) {
        toast.error(message, { duration: 8000 });
    } else {
        toast(message, { duration: 6000 });
    }
}

export function useNotifications() {
    const { notificationsSocket, isNotificationsConnected } = useWebSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const shownLifecycleNotificationIds = useRef(new Set<string>());

    // listen for incoming notifications
    useEffect(() => {
        if (!notificationsSocket) return;

        const handleNewNotification = (notification: Notification) => {
            setNotifications((prev) => [notification, ...prev]);
            if (!notification.isRead) {
                setUnreadCount((prev) => prev + 1);
            }
            showLifecycleNotification(notification, shownLifecycleNotificationIds.current);
        };

        const handleNotificationUpdated = (notification: Notification) => {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? notification : n))
            );
            showLifecycleNotification(notification, shownLifecycleNotificationIds.current);
        };

        const handleNotificationRead = (data: NotificationReadEvent) => {
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
                return;
            }

            notificationsSocket.emit("mark-as-read", { notificationId });

            notificationsSocket.once(
                "mark-as-read:success",
                () => {}
            );
        },
        [notificationsSocket, isNotificationsConnected]
    );

    const markAllAsRead = useCallback(() => {
        if (!notificationsSocket || !isNotificationsConnected) {
            return;
        }

        notificationsSocket.emit("mark-all-as-read", {});

        notificationsSocket.once(
            "mark-all-as-read:success",
            () => {
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
