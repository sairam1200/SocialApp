"use client";

import { io, Socket } from "socket.io-client";

type SocketNamespace = "notifications" | "imports";

export class WebSocketService {
    private sockets: Map<SocketNamespace, Socket> = new Map();
    private reconnectAttempts: Map<SocketNamespace, number> = new Map();

    private readonly maxReconnectAttempts = 5;

    constructor(private readonly baseUrl: string) {
        console.log("[WebSocketService] Initialized:", baseUrl);
    }

    connect(namespace: SocketNamespace, token?: string): Socket | null {
        console.log(
            `[WebSocketService:${namespace}] Starting connection...`
        );

        if (!token) {
            console.warn(
                `[WebSocketService:${namespace}] Missing access token`
            );
            return null;
        }

        const existingSocket = this.sockets.get(namespace);

        if (existingSocket) {
            if (existingSocket.connected) {
                console.log(
                    `[WebSocketService:${namespace}] Reusing existing connection`
                );
                return existingSocket;
            }

            existingSocket.removeAllListeners();
            existingSocket.disconnect();

            this.sockets.delete(namespace);
        }

        try {
            const socketUrl = `${this.baseUrl}/${namespace}`;

            console.log(
                `[WebSocketService:${namespace}] Connecting to:`,
                socketUrl
            );

            const socket = io(socketUrl, {
                auth: {
                    token,
                },

                transports: ["websocket", "polling"],

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
        } catch (error) {
            console.error(
                `[WebSocketService:${namespace}] Failed to create socket`,
                error
            );

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

        console.log(
            `[WebSocketService:${namespace}] Disconnected successfully`
        );
    }

    disconnectAll(): void {
        this.sockets.forEach((socket, namespace) => {
            socket.removeAllListeners();
            socket.disconnect();

            console.log(
                `[WebSocketService:${namespace}] Disconnected`
            );
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

    reconnectWithNewToken(
        namespace: SocketNamespace,
        token?: string
    ): Socket | null {
        console.log(
            `[WebSocketService:${namespace}] Reconnecting with new token`
        );

        this.disconnect(namespace);

        return this.connect(namespace, token);
    }

    reconnectAllWithNewToken(token?: string): void {
        const namespaces = Array.from(this.sockets.keys());

        namespaces.forEach((namespace) => {
            this.reconnectWithNewToken(namespace, token);
        });
    }

    private setupSocketListeners(
        socket: Socket,
        namespace: SocketNamespace
    ): void {
        socket.on("connect", () => {
            console.log(
                `[WebSocketService:${namespace}] Connected`
            );

            console.log({
                socketId: socket.id,
                connected: socket.connected,
            });

            this.reconnectAttempts.set(namespace, 0);
        });

        socket.on(
            "connected",
            (data: { connectedUserId: string }) => {
                console.log(
                    `[WebSocketService:${namespace}] Authenticated user:`,
                    data.connectedUserId
                );
            }
        );

        socket.on("disconnect", (reason) => {
            console.warn(
                `[WebSocketService:${namespace}] Disconnected`,
                reason
            );
        });

        socket.on("connect_error", (error) => {
            const attempts =
                this.reconnectAttempts.get(namespace) ?? 0;

            this.reconnectAttempts.set(
                namespace,
                attempts + 1
            );

            console.error(
                `[WebSocketService:${namespace}] Connection error (${attempts + 1}/${this.maxReconnectAttempts})`,
                error
            );

            if (attempts >= this.maxReconnectAttempts) {
                console.error(
                    `[WebSocketService:${namespace}] Maximum reconnect attempts reached`
                );

                socket.disconnect();
            }
        });

        socket.on("error", (error) => {
            if (
                error &&
                typeof error === "object" &&
                "message" in error
            ) {
                const message = (error as { message?: string })
                    .message;

                if (
                    message ===
                    "Cannot join other user rooms"
                ) {
                    return;
                }
            }

            console.error(
                `[WebSocketService:${namespace}] Socket error`,
                error
            );
        });

        socket.io.on("error", (error) => {
            console.error(
                `[WebSocketService:${namespace}] Manager error`,
                error
            );
        });

        /**
         * Debug listener for ImportGateway
         */
        socket.on("new-content", (payload) => {
            console.log(
                `[WebSocketService:${namespace}] new-content received`,
                payload
            );
        });

        /**
         * Catch-all listener
         * Extremely useful while debugging
         */
        socket.onAny((event, ...args) => {
            console.log(
                `[WebSocketService:${namespace}] Event: ${event}`,
                args
            );
        });
    }
}

let wsService: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService {
    if (typeof window === "undefined") {
        throw new Error(
            "WebSocketService can only be used on the client side"
        );
    }

    if (!wsService) {
        const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL;

        if (!apiBaseUrl) {
            throw new Error(
                "NEXT_PUBLIC_API_BASE_URL is not defined"
            );
        }

        const wsBaseUrl = apiBaseUrl.replace(
            /\/api\/v1\/?$/,
            ""
        );

        console.log(
            "[WebSocketService] API Base URL:",
            apiBaseUrl
        );

        console.log(
            "[WebSocketService] WebSocket Base URL:",
            wsBaseUrl
        );

        wsService = new WebSocketService(wsBaseUrl);
    }

    return wsService;
}