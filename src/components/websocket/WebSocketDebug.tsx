"use client";

import { useWebSocket } from "@/contexts/WebSocketContext";
import { useState } from "react";
import { Socket } from "socket.io-client";

export default function WebSocketDebug() {
  const { notificationsSocket, importsSocket } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);

  // Helper to manually trigger socket event listeners
  const triggerSocketEvent = (socket: Socket, eventName: string, data: unknown) => {
    // Access internal event emitter to trigger listeners
    const socketWithCallbacks = socket as Socket & {
      _callbacks?: Record<string, Array<(data: unknown) => void>>;
    };
    
    const listeners = socketWithCallbacks._callbacks?.[`$${eventName}`] || [];
    listeners.forEach((listener) => {
      listener(data);
    });
  };

  const testForceLogout = () => {
    if (!notificationsSocket) return;
    
    triggerSocketEvent(notificationsSocket, 'force-logout', {
      reason: 'security',
      message: 'Test: Session terminated from debug panel'
    });
  };

  const testSessionAlert = () => {
    if (!notificationsSocket) return;
    
    triggerSocketEvent(notificationsSocket, 'session-alert', {
      type: 'warning',
      message: 'Test: Unusual login detected from new location'
    });
  };

  const testNewNotification = () => {
    if (!notificationsSocket) return;
    
    triggerSocketEvent(notificationsSocket, 'new-notification', {
      id: `test-${Date.now()}`,
      title: 'Test Notification',
      body: 'This is a test notification from debug panel',
      type: 'test',
      link: null,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const testNewImport = () => {
    if (!importsSocket) return;
    
    triggerSocketEvent(importsSocket, 'new-content', {
      platform: 'instagram',
      content: {
        id: `test-${Date.now()}`,
        title: 'Test Instagram Post',
        url: 'https://instagram.com/test',
        thumbnail: 'https://lh3.googleusercontent.com/a/default-user',
      }
    });
  };

  const testProfileUpdate = () => {
    if (!notificationsSocket) return;
    
    triggerSocketEvent(notificationsSocket, 'profile-update', {
      userId: 'abb83bcf-623f-4472-857a-70d3ea8fdec9', 
      updates: {
        username: 'TestUpdated',
        photo: 'https://lh3.googleusercontent.com/a/default-user',
      }
    });
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors font-mono text-sm"
      >
        🐛 WS Debug
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-72 space-y-2 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">WebSocket Test Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-gray-600 mb-2">Security Events:</p>
            
            <button
              onClick={testForceLogout}
              disabled={!notificationsSocket}
              className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              🚪 Force Logout
            </button>

            <button
              onClick={testSessionAlert}
              disabled={!notificationsSocket}
              className="w-full bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ⚠️ Session Alert
            </button>

            <button
              onClick={testProfileUpdate}
              disabled={!notificationsSocket}
              className="w-full bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              👤 Profile Update
            </button>

            <hr className="my-3" />
            
            <p className="text-xs text-gray-600 mb-2">Content Events:</p>

            <button
              onClick={testNewNotification}
              disabled={!notificationsSocket}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              🔔 New Notification
            </button>

            <button
              onClick={testNewImport}
              disabled={!importsSocket}
              className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              📥 New Import
            </button>
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Notifications:</span>
              <span>{notificationsSocket ? '🟢 Connected' : '🔴 Disconnected'}</span>
            </div>
            <div className="flex justify-between">
              <span>Imports:</span>
              <span>{importsSocket ? '🟢 Connected' : '🔴 Disconnected'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}