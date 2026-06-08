"use client";

import { io, Socket } from "socket.io-client";

type SocketNamespace = "notifications" | "imports";

export class WebSocketService {
    private sockets: Map<SocketNamespace, Socket> = new Map();
    private reconnectAttempts: Map<SocketNamespace, number> = new Map();
    private maxReconnectAttempts = 5;

    constructor(private baseUrl: string) {
        console.log("[WebSocketService] Initialized with baseUrl:", baseUrl);
    }

    /**
     * connect to namespace
     */
    connect(namespace: SocketNamespace, token?: string): Socket | null {
        console.log(`[WebSocketService] Attempting to connect to ${namespace}`);
        
        // if already connected, return existing socket
        if (this.sockets.has(namespace)) {
            const existingSocket = this.sockets.get(namespace)!;
            if (existingSocket.connected) {
                console.log(`[WebSocketService:${namespace}] Already connected, returning existing socket`);
                return existingSocket;
            }
            console.log(`[WebSocketService:${namespace}] Existing socket not connected, cleaning up`);
            existingSocket.disconnect();
            this.sockets.delete(namespace);
        }

        // use provided token or try to get from cookies
        if (!token) {
            console.warn(
                `[WebSocketService:${namespace}] No access token provided, skipping connection`
            );
            return null;
        }

        try {
            // Check if baseUrl already has a path - if so, don't append namespace
            // This handles cases where backend uses query params or different routing
            const socketUrl = `${this.baseUrl}/${namespace}`;
            console.log(`[WebSocketService:${namespace}] Creating socket connection to:`, socketUrl);
            console.log(`[WebSocketService:${namespace}] With auth token:`, token ? 'Token provided' : 'No token');
            
            const socket = io(socketUrl, {
                auth: { token },
                transports: ["websocket", "polling"], // Add polling as fallback
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: this.maxReconnectAttempts,
                // Add these for better debugging
                autoConnect: true,
                forceNew: true,
            });

            console.log(`[WebSocketService:${namespace}] Socket instance created:`, !!socket);
            
            this.setupSocketListeners(socket, namespace);
            this.sockets.set(namespace, socket);
            this.reconnectAttempts.set(namespace, 0);

            return socket;
        } catch (error) {
            console.error(`[WebSocketService:${namespace}] Error creating socket:`, error);
            return null;
        }
    }

    disconnect(namespace: SocketNamespace): void {
        const socket = this.sockets.get(namespace);
        if (socket) {
            socket.disconnect();
            this.sockets.delete(namespace);
            this.reconnectAttempts.delete(namespace);
            console.log(`[WebSocketService:${namespace}] Disconnected`);
        }
    }

    disconnectAll(): void {
        this.sockets.forEach((socket, namespace) => {
            socket.disconnect();
            console.log(`[WebSocketService:${namespace}] Disconnected`);
        });
        this.sockets.clear();
        this.reconnectAttempts.clear();
    }

    getSocket(namespace: SocketNamespace): Socket | null {
        return this.sockets.get(namespace) || null;
    }

    isConnected(namespace: SocketNamespace): boolean {
        const socket = this.sockets.get(namespace);
        return socket ? socket.connected : false;
    }

    reconnectWithNewToken(namespace: SocketNamespace, token?: string): void {
        console.log(`[WebSocketService:${namespace}] Reconnecting with new token...`);
        this.disconnect(namespace);
        this.connect(namespace, token);
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
            console.log(`[WebSocketService:${namespace}] Connected successfully (socket.id: ${socket.id})`);
            this.reconnectAttempts.set(namespace, 0);
        });

        socket.on("connected", (data: { connectedUserId: string }) => {
            console.log(
                `[WebSocketService:${namespace}] Authenticated as:`,
                data.connectedUserId
            );
        });

        socket.on("disconnect", (reason) => {
            console.log(`[WebSocketService:${namespace}] Disconnected:`, reason);
        });

        socket.on("connect_error", (error) => {
            const attempts = this.reconnectAttempts.get(namespace) || 0;
            this.reconnectAttempts.set(namespace, attempts + 1);

            console.error(
                `[WebSocketService:${namespace}] Connection error (attempt ${attempts + 1}/${this.maxReconnectAttempts}):`,
                error.message,
                '\nFull error:',
                error
            );

            // Log additional details that might help debug
            if ('description' in error) {
                console.error(`[WebSocketService:${namespace}] Error description:`, (error as Record<string, unknown>).description);
            }
            if ('context' in error) {
                console.error(`[WebSocketService:${namespace}] Error context:`, (error as Record<string, unknown>).context);
            }

            if (attempts >= this.maxReconnectAttempts) {
                console.error(
                    `[WebSocketService:${namespace}] Max reconnection attempts reached`
                );
                socket.disconnect();
            }
        });

        socket.on("error", (error) => {
            // ✅ Suppress "Cannot join other user rooms" error until backend fixes it
            if (error && typeof error === "object" && "message" in error) {
                const errorMessage = (error as { message?: string }).message;
                if (errorMessage === "Cannot join other user rooms") {
                    // Silent ignore - backend needs to fix their join validation
                    return;
                }
            }

            console.error(`[WebSocketService:${namespace}] Socket error:`, error);
        });

        // Add listener for namespace-specific errors
        socket.io.on("error", (error) => {
            console.error(`[WebSocketService:${namespace}] Manager error:`, error);
        });
    }
}

// Singleton instance
let wsService: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService {
    if (typeof window === "undefined") {
        throw new Error("WebSocketService can only be used on the client side");
    }

    if (!wsService) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiBaseUrl) {
            throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
        }
        
        // Remove /api/v1 from the base URL for WebSocket connections
        // Socket.IO typically runs on the root, not under /api/v1
        const wsBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
        
        console.log("[WebSocketService] API Base URL:", apiBaseUrl);
        console.log("[WebSocketService] WebSocket Base URL:", wsBaseUrl);
        console.log("[WebSocketService] Creating singleton instance");
        
        wsService = new WebSocketService(wsBaseUrl);
    }

    return wsService;
}
