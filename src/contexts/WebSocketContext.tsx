import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import { Socket } from "socket.io-client";
import {
  getWebSocketService,
  WebSocketService,
} from "@/services/websocket.service";
import { useAuthUserStore } from "@/store/auth-user.store";

interface WebSocketContextValue {
  wsService: WebSocketService | null;
  notificationsSocket: Socket | null;
  importsSocket: Socket | null;
  engagementSocket: Socket | null;
  connectNotifications: () => void;
  connectImports: () => void;
  disconnectNotifications: () => void;
  disconnectImports: () => void;
  isNotificationsConnected: boolean;
  isImportsConnected: boolean;
  isEngagementConnected: boolean;
}

const WebSocketContext =
  createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, authUser } = useAuthUserStore();

  const wsServiceRef = useRef<WebSocketService | null>(null);

  const [notificationsSocket, setNotificationsSocket] =
    React.useState<Socket | null>(null);

  const [importsSocket, setImportsSocket] =
    React.useState<Socket | null>(null);

  const [engagementSocket, setEngagementSocket] =
    React.useState<Socket | null>(null);

  const [isNotificationsConnected, setIsNotificationsConnected] =
    React.useState(false);

  const [isImportsConnected, setIsImportsConnected] =
    React.useState(false);

  const [isEngagementConnected, setIsEngagementConnected] =
    React.useState(false);

  /**
   * Existing initialization logic
   * No major changes here
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        wsServiceRef.current = getWebSocketService();
      } catch {
        // Service init failed; will be retried on connect
      }
    }

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnectAll();
      }
    };
  }, []);

  /**
   * Engagement counters are public, so this socket is available to both
   * signed-in users and guests. It only subscribes to read-only counter rooms;
   * mutations continue to go through the rate-limited HTTP endpoint.
   */
  useEffect(() => {
    const wsService = wsServiceRef.current;
    if (!wsService) return;

    const socket = wsService.connect("engagement");
    if (!socket) return;

    setEngagementSocket(socket);
    setIsEngagementConnected(socket.connected);

    const handleConnect = () => setIsEngagementConnected(true);
    const handleDisconnect = () => setIsEngagementConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      wsService.disconnect("engagement");
      setEngagementSocket(null);
      setIsEngagementConnected(false);
    };
  }, []);

  /**
   * PERFORMANCE FIX:
   *
   * Use requestIdleCallback to defer WebSocket connections until the browser
   * is idle (after page interactive). Falls back to setTimeout for browsers
   * without requestIdleCallback support.
   *
   * Previously: 3s setTimeout — still blocked during main thread work.
   * Now: waits for browser idle — connections start after page is fully painted.
  */
  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      return;
    }

    const wsService = wsServiceRef.current;
    if (!wsService) return;

    let cancelled = false;

    const connectSockets = () => {
      if (cancelled) return;

      /**
       * Notifications socket
       */
      const notifSocket = wsService.connect(
        "notifications"
      );

      if (notifSocket) {
        setNotificationsSocket(notifSocket);

        let hasJoinedNotifications = false;

        notifSocket.on("connect", () => {
          if (!cancelled) setIsNotificationsConnected(true);
        });

        notifSocket.on(
          "connected",
          (data: { connectedUserId: string }) => {
            if (!hasJoinedNotifications) {
              notifSocket.emit("join", data.connectedUserId);
              hasJoinedNotifications = true;
            }
          }
        );

        notifSocket.on("disconnect", () => {
          if (!cancelled) {
            setIsNotificationsConnected(false);
            hasJoinedNotifications = false;
          }
        });
      }

      /**
       * Imports socket — staggered 1s after notifications to avoid burst
       */
      setTimeout(() => {
        if (cancelled) return;

          const importSocket = wsService.connect(
          "imports"
        );

        if (importSocket) {
          setImportsSocket(importSocket);

          let hasJoinedImports = false;

          importSocket.on("connect", () => {
            if (!cancelled) setIsImportsConnected(true);
          });

          importSocket.on(
            "connected",
            (data: { connectedUserId: string }) => {
              if (!hasJoinedImports) {
                importSocket.emit("join", data.connectedUserId);
                hasJoinedImports = true;
              }
            }
          );

          importSocket.on("disconnect", () => {
            if (!cancelled) {
              setIsImportsConnected(false);
              hasJoinedImports = false;
            }
          });
        }
      }, 1000);
    };

    // Defer to browser idle — connections start after page is fully interactive
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = requestIdleCallback(connectSockets, { timeout: 10000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
        wsService.disconnect("notifications");
        wsService.disconnect("imports");
        setNotificationsSocket(null);
        setImportsSocket(null);
        setIsNotificationsConnected(false);
        setIsImportsConnected(false);
      };
    } else {
      // Fallback: 2s delay for browsers without requestIdleCallback
      const timeout = setTimeout(connectSockets, 2000);
      return () => {
        cancelled = true;
        clearTimeout(timeout);
        wsService.disconnect("notifications");
        wsService.disconnect("imports");
        setNotificationsSocket(null);
        setImportsSocket(null);
        setIsNotificationsConnected(false);
        setIsImportsConnected(false);
      };
    }
  }, [isAuthenticated, authUser]);

  /**
   * Existing manual connect logic untouched
   */
  const connectNotifications = React.useCallback(() => {
    if (!wsServiceRef.current) return;

    const socket = wsServiceRef.current.connect(
      "notifications"
    );

    if (socket) {
      setNotificationsSocket(socket);

      socket.on("connect", () => {
        setIsNotificationsConnected(true);
      });

      socket.on(
        "connected",
        (data: { connectedUserId: string }) => {
          socket.emit("join", data.connectedUserId);
        }
      );

      socket.on("disconnect", () => {
        setIsNotificationsConnected(false);
      });
    }
  }, []);

  const connectImports = React.useCallback(() => {
    if (!wsServiceRef.current) return;

    const socket = wsServiceRef.current.connect(
      "imports"
    );

    if (socket) {
      setImportsSocket(socket);

      socket.on("connect", () => {
        setIsImportsConnected(true);
      });

      socket.on(
        "connected",
        (data: { connectedUserId: string }) => {
          socket.emit("join", data.connectedUserId);
        }
      );

      socket.on("disconnect", () => {
        setIsImportsConnected(false);
      });
    }
  }, []);

  const disconnectNotifications = React.useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect("notifications");
      setNotificationsSocket(null);
      setIsNotificationsConnected(false);
    }
  }, []);

  const disconnectImports = React.useCallback(() => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect("imports");
      setImportsSocket(null);
      setIsImportsConnected(false);
    }
  }, []);

  const value: WebSocketContextValue = useMemo(() => ({
    wsService: wsServiceRef.current,
    notificationsSocket,
    importsSocket,
    engagementSocket,
    connectNotifications,
    connectImports,
    disconnectNotifications,
    disconnectImports,
    isNotificationsConnected,
    isImportsConnected,
    isEngagementConnected,
  }), [notificationsSocket, importsSocket, engagementSocket, connectNotifications, connectImports, disconnectNotifications, disconnectImports, isNotificationsConnected, isImportsConnected, isEngagementConnected]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

const DEFAULT_WEBSOCKET_CONTEXT: WebSocketContextValue = {
  wsService: null,
  notificationsSocket: null,
  importsSocket: null,
  engagementSocket: null,
  connectNotifications: () => {},
  connectImports: () => {},
  disconnectNotifications: () => {},
  disconnectImports: () => {},
  isNotificationsConnected: false,
  isImportsConnected: false,
  isEngagementConnected: false,
};

export function useWebSocket(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  return context ?? DEFAULT_WEBSOCKET_CONTEXT;
}
