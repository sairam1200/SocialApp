"use client";

import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";

interface BookmarkEventPayload {
    contentId: string;
}

export function useBookmarkSocket(
    onBookmarkAdded: (contentId: string) => void,
    onBookmarkRemoved: (contentId: string) => void,
) {
    const { notificationsSocket, importsSocket } = useWebSocket();

    useEffect(() => {
        const handleBookmarkAdded = (payload: BookmarkEventPayload) => {
            if (payload?.contentId) {
                onBookmarkAdded(payload.contentId);
            }
        };

        const handleBookmarkRemoved = (payload: BookmarkEventPayload) => {
            if (payload?.contentId) {
                onBookmarkRemoved(payload.contentId);
            }
        };

        const sockets = [notificationsSocket, importsSocket].filter(
            (s): s is NonNullable<typeof s> => !!s,
        );

        sockets.forEach((socket) => {
            socket.on("bookmark-added", handleBookmarkAdded);
            socket.on("bookmark-removed", handleBookmarkRemoved);
        });

        return () => {
            sockets.forEach((socket) => {
                socket.off("bookmark-added", handleBookmarkAdded);
                socket.off("bookmark-removed", handleBookmarkRemoved);
            });
        };
    }, [notificationsSocket, importsSocket, onBookmarkAdded, onBookmarkRemoved]);
}
