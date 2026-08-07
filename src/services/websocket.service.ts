"use client";

import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./apiClient.service";

type SocketNamespace = "notifications" | "imports" | "engagement";

export class WebSocketService {
    private sockets: Map<SocketNamespace, Socket> = new Map();
    private reconnectAttempts: Map<SocketNamespace, number> = new Map();

    private readonly maxReconnectAttempts = 5;

    constructor(private readonly baseUrl: string) {
    }

    connect(namespace: SocketNamespace): Socket | null {
        const existingSocket = this.sockets.get(namespace);

        if (existingSocket) {
            if (existingSocket.connected) {
                return existingSocket;
            }

            existingSocket.removeAllListeners();
            existingSocket.disconnect();

            this.sockets.delete(namespace);
        }

        try {
            const socketUrl = `${this.baseUrl}/${namespace}`;
            const hasDedicatedWebSocketOrigin = Boolean(
                process.env.NEXT_PUBLIC_WEBSOCKET_URL?.trim(),
            );

            const socket = io(socketUrl, {
                withCredentials: true,

                // Keep the Engine.IO path explicit because this is a Socket.IO
                // server, not a generic WebSocket endpoint.
                path: "/socket.io",

                // Vercel's external rewrite handles the polling handshake, but
                // the deployed proxy rejects the WebSocket upgrade. Use
                // polling unless the app is pointed directly at a backend
                // origin that is known to support Socket.IO upgrades.
                addTrailingSlash: false,
                transports: hasDedicatedWebSocketOrigin
                    ? ["websocket", "polling"]
                    : ["polling"],
                upgrade: hasDedicatedWebSocketOrigin,

                autoConnect: true,

                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,

                timeout: 20000,
            });

            this.setupSocketListeners(socket, namespace);

            this.sockets.set(namespace, socket);
            this.reconnectAttempts.set(namespace, 0);

            return socket;
        } catch {
            return null;
        }
    }

    disconnect(namespace: SocketNamespace): void {
        const socket = this.sockets.get(namespace);

        if (!socket) {
            return;
        }

        socket.removeAllListeners();
        socket.disconnect();

        this.sockets.delete(namespace);
        this.reconnectAttempts.delete(namespace);
    }

    disconnectAll(): void {
        this.sockets.forEach((socket) => {
            socket.removeAllListeners();
            socket.disconnect();
        });

        this.sockets.clear();
        this.reconnectAttempts.clear();
    }

    getSocket(namespace: SocketNamespace): Socket | null {
        return this.sockets.get(namespace) ?? null;
    }

    isConnected(namespace: SocketNamespace): boolean {
        const socket = this.sockets.get(namespace);

        return socket?.connected ?? false;
    }

    reconnect(namespace: SocketNamespace): Socket | null {
        this.disconnect(namespace);

        return this.connect(namespace);
    }

    reconnectAll(): void {
        const namespaces = Array.from(this.sockets.keys());

        namespaces.forEach((namespace) => {
            this.reconnect(namespace);
        });
    }

    private setupSocketListeners(
        socket: Socket,
        namespace: SocketNamespace
    ): void {
        socket.on("connect", () => {
            this.reconnectAttempts.set(namespace, 0);
        });

        socket.on(
            "connected",
            () => {}
        );

        socket.on("disconnect", () => {
        });

        socket.on("connect_error", () => {
            const attempts =
                this.reconnectAttempts.get(namespace) ?? 0;

            this.reconnectAttempts.set(
                namespace,
                attempts + 1
            );

            if (attempts >= this.maxReconnectAttempts) {
                socket.disconnect();
            }
        });

        socket.on("error", () => {
        });

        socket.io.on("error", () => {
        });

        /**
         * Debug listener for ImportGateway
         */
        socket.on("new-content", () => {
        });

        /**
         * Catch-all listener
         */
        socket.onAny(() => {
        });
    }
}

let wsService: WebSocketService | null = null;

/**
 * A socket needs an absolute origin; the API base may be a relative path.
 *
 * `"/api/v1"` → this page's origin. Anything already absolute is left alone.
 */
function toOrigin(base: string): string {
    if (!base || base.startsWith("/")) return window.location.origin;
    return base;
}

export function getWebSocketService(): WebSocketService {
    if (typeof window === "undefined") {
        throw new Error(
            "WebSocketService can only be used on the client side"
        );
    }

    if (!wsService) {
        // Same source of truth as every HTTP call, so the socket cannot end up
        // pointed somewhere else. Throwing when the variable was unset made an
        // unconfigured deployment fail *loudly on every page* rather than
        // simply going without live updates — and the default it lacked is
        // exactly the same-origin rewrite the HTTP client uses.
        const configuredWebSocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL?.trim();
        const wsBaseUrl = toOrigin(
            (configuredWebSocketUrl || API_BASE_URL.replace(/\/api\/v1\/?$/, "")).replace(/\/$/, ""),
        );

        wsService = new WebSocketService(wsBaseUrl);
    }

    return wsService;
}
