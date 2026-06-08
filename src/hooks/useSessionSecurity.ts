"use client";

import { useEffect, useCallback } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useAuthUserStore } from "@/store/auth-user.store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { logoutFn } from "@/utils/logout.utitl";
import { getDeviceIdOrNull } from "@/utils/deviceId.util";

interface ForceLogoutEvent {
    reason: string;
    message?: string;
}

interface SessionAlertEvent {
    type: "warning" | "info" | "security";
    message: string;
    action?: string;
}

interface ProfileUpdateEvent {
    userId: string;
    updates: {
        username?: string;
        email?: string;
        photo?: string;
        [key: string]: unknown;
    };
}

export function useSessionSecurity() {
    const { notificationsSocket } = useWebSocket();
    const { clearAuthUser, authUser, updateAuthUser } = useAuthUserStore();
    const router = useRouter();

    // Handle force logout
    const handleForceLogout = useCallback(
        async (data: ForceLogoutEvent) => {
            console.log("[SessionSecurity] Force logout received:", data);

            toast.error(data.message || "Your session has been terminated", {
                duration: 5000,
            });

            // clear auth user state
            clearAuthUser();

            // call logout action to clear server-side session
            try {
                await logoutFn(getDeviceIdOrNull());
            } catch (error) {
                console.error("[SessionSecurity] Logout action failed:", error);
            }

            // disconnect sockets
            if (notificationsSocket) {
                notificationsSocket.disconnect();
            }

            // redirect to login with alert message
            const message = encodeURIComponent(
                data.message || "Your session has been terminated"
            );
            router.push(`/login?alert=${message}`);
        },
        [clearAuthUser, router, notificationsSocket]
    );

    // Handle session alerts
    const handleSessionAlert = useCallback((data: SessionAlertEvent) => {
        console.log("[SessionSecurity] Session alert:", data);

        switch (data.type) {
            case "warning":
                toast.error(data.message, { duration: 6000 });
                break;
            case "security":
                toast.error(data.message, { duration: 8000 });
                break;
            case "info":
                toast(data.message, { duration: 4000 });
                break;
        }
    }, []);

    // Handle profile updates
    const handleProfileUpdate = useCallback(
        (data: ProfileUpdateEvent) => {
            console.log("[SessionSecurity] Profile update:", data);

            if (authUser && data.userId === authUser.id) {
                // update auth user state
                updateAuthUser(data.updates);

                toast.success("Your profile has been updated", {
                    duration: 3000,
                });

                // if username changed, refresh the page to update URLs
                if (data.updates.username && data.updates.username !== authUser.username) {
                    router.refresh();
                }
            }
        },
        [authUser, updateAuthUser, router]
    );

    // Setup listeners
    useEffect(() => {
        if (!notificationsSocket) return;

        notificationsSocket.on("force-logout", handleForceLogout);
        notificationsSocket.on("session-alert", handleSessionAlert);
        notificationsSocket.on("profile-update", handleProfileUpdate);

        return () => {
            notificationsSocket.off("force-logout", handleForceLogout);
            notificationsSocket.off("session-alert", handleSessionAlert);
            notificationsSocket.off("profile-update", handleProfileUpdate);
        };
    }, [notificationsSocket, handleForceLogout, handleSessionAlert, handleProfileUpdate]);

    return {
        isConnected: notificationsSocket?.connected ?? false,
    };
}