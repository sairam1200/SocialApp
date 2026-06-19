"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import type { NewContentEvent, ImportPlatform } from "@/types/websocket.types";

export function useImports() {
    const { importsSocket, isImportsConnected } = useWebSocket();
    const [recentImports, setRecentImports] = useState<NewContentEvent[]>([]);
    const [importsByPlatform, setImportsByPlatform] = useState<Map<ImportPlatform, NewContentEvent[]>>(new Map());

    useEffect(() => {
        if (!importsSocket) return;

        const handleNewContent = (data: NewContentEvent) => {
            console.log("[Imports] New content from:", data.platform, data.title);

            // add to recent imports
            setRecentImports((prev) => [data, ...prev].slice(0, 50)); // save up to 50 recent imports

            // add to platform-specific list
            setImportsByPlatform((prev) => {
                const updated = new Map(prev);
                const platformImports = updated.get(data.platform) || [];
                updated.set(data.platform, [data, ...platformImports].slice(0, 20));
                return updated;
            });
        };

        importsSocket.on("new-content", handleNewContent);

        return () => {
            importsSocket.off("new-content", handleNewContent);
        };
    }, [importsSocket]);

    return {
        recentImports,
        importsByPlatform,
        isConnected: isImportsConnected,
    };
}