import React, {
  createContext,
  useContext,
  useEffect,
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
  connectNotifications: () => void;
  connectImports: () => void;
  disconnectNotifications: () => void;
  disconnectImports: () => void;
  isNotificationsConnected: boolean;
  isImportsConnected: boolean;
}

const WebSocketContext =
  createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  accessToken?: string | null;
}

export function WebSocketProvider({
  children,
  accessToken,
}: WebSocketProviderProps) {
  const { isAuthenticated, authUser } = useAuthUserStore();

  const wsServiceRef = useRef<WebSocketService | null>(null);

  const [notificationsSocket, setNotificationsSocket] =
    React.useState<Socket | null>(null);

  const [importsSocket, setImportsSocket] =
    React.useState<Socket | null>(null);

  const [isNotificationsConnected, setIsNotificationsConnected] =
    React.useState(false);

  const [isImportsConnected, setIsImportsConnected] =
    React.useState(false);

  /**
   * Existing initialization logic
   * No major changes here
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        wsServiceRef.current = getWebSocketService();
      } catch (error) {
        console.error(
          "[WebSocket] Failed to initialize service:",
          error
        );
      }
    }

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnectAll();
      }
    };
  }, []);

  /**
   * PERFORMANCE FIX:
   *
   * Previously sockets connected immediately after login.
   * That caused:
   * - socket handshakes
   * - event listener registration
   * - state updates
   * right during route navigation.
   *
   * Result = login feels laggy.
   *
   * Fix:
   * Delay socket connection by 3 seconds so UI loads first.
   */
  useEffect(() => {
    /**
     * CHANGE:
     * Early return if auth/session not ready.
     */
    console.log("WS STATE", {
    isAuthenticated,
    authUser,
    accessToken,
    hasWsService: !!wsServiceRef.current,
});
    if (!isAuthenticated || !authUser || !accessToken) {
       console.log("WS BLOCKED", {
    isAuthenticated,
    hasUser: !!authUser,
    hasToken: !!accessToken,
  });
      return;
    }

    /**
     * CHANGE:
     * Capture stable reference BEFORE timeout.
     * Prevents TS null errors.
     */
    const wsService = wsServiceRef.current;

    if (!wsService) {
      return;
    }

    /**
     * CHANGE:
     * Delay expensive websocket boot.
     */
    console.log("WEBSOCKET CONNECT STARTING");
    const timeout = setTimeout(() => {
      console.log(
        "[WebSocket] Delayed auto-connecting after login..."
      );

      /**
       * Notifications socket
       */
      const notifSocket = wsService.connect(
        "notifications",
        accessToken ?? undefined
      );

      if (notifSocket) {
        setNotificationsSocket(notifSocket);

        let hasJoinedNotifications = false;

        notifSocket.on("connect", () => {
          console.log(
            "[WebSocket:notifications] Connected"
          );
          setIsNotificationsConnected(true);
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
          console.log(
            "[WebSocket:notifications] Disconnected"
          );

          setIsNotificationsConnected(false);
          hasJoinedNotifications = false;
        });
      }

      /**
       * Imports socket
       */
      const importSocket = wsService.connect(
        "imports",
        accessToken ?? undefined
      );

      if (importSocket) {
        setImportsSocket(importSocket);

        let hasJoinedImports = false;

        importSocket.on("connect", () => {
          console.log("[WebSocket:imports] Connected");
          setIsImportsConnected(true);
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
          console.log(
            "[WebSocket:imports] Disconnected"
          );

          setIsImportsConnected(false);
          hasJoinedImports = false;
        });
      }
    }, 3000);

    /**
     * CHANGE:
     * Cleanup timeout + sockets properly
     */
    return () => {
      clearTimeout(timeout);

      wsService.disconnectAll();

      setNotificationsSocket(null);
      setImportsSocket(null);

      setIsNotificationsConnected(false);
      setIsImportsConnected(false);
    };
  }, [isAuthenticated, authUser, accessToken]);

  /**
   * Existing manual connect logic untouched
   */
  const connectNotifications = React.useCallback(() => {
    if (!wsServiceRef.current || !accessToken) return;

    const socket = wsServiceRef.current.connect(
      "notifications",
      accessToken ?? undefined
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
  }, [accessToken]);

  const connectImports = React.useCallback(() => {
    if (!wsServiceRef.current || !accessToken) return;

    const socket = wsServiceRef.current.connect(
      "imports",
      accessToken ?? undefined
    );

    if (socket) {
      setImportsSocket(socket);

      socket.on("connect", () => {
        setIsImportsConnected(true);
      });

      socket.on(
        "connected",
        (data: { connectedUserId: string }) => {
          socket.emit("join", {
            userId: data.connectedUserId,
          });
        }
      );

      socket.on("disconnect", () => {
        setIsImportsConnected(false);
      });
    }
  }, [accessToken]);

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

  const value: WebSocketContextValue = {
    wsService: wsServiceRef.current,
    notificationsSocket,
    importsSocket,
    connectNotifications,
    connectImports,
    disconnectNotifications,
    disconnectImports,
    isNotificationsConnected,
    isImportsConnected,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextValue {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error(
      "useWebSocket must be used within WebSocketProvider"
    );
  }

  return context;
}