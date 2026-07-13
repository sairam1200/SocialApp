"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useQueryClient } from "@tanstack/react-query";
import type { NewContentEvent, ImportPlatform } from "@/types/websocket.types";

export function useImports() {
    const { importsSocket, isImportsConnected } = useWebSocket();
    const [recentImports, setRecentImports] = useState<NewContentEvent[]>([]);
    const [importsByPlatform, setImportsByPlatform] = useState<Map<ImportPlatform, NewContentEvent[]>>(new Map());
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!importsSocket) return;

        const handleNewContent = (data: NewContentEvent) => {
            console.log("[Imports] New content from:", data.platform, data.title);

            setRecentImports((prev) => [data, ...prev].slice(0, 50));

            setImportsByPlatform((prev) => {
                const updated = new Map(prev);
                const platformImports = updated.get(data.platform) || [];
                updated.set(data.platform, [data, ...platformImports].slice(0, 20));
                return updated;
            });

            queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
            queryClient.invalidateQueries({ queryKey: ["discover"] });
            queryClient.invalidateQueries({ queryKey: ["search"] });
        };

        importsSocket.on("new-content", handleNewContent);

        return () => {
            importsSocket.off("new-content", handleNewContent);
        };
    }, [importsSocket, queryClient]);

    return {
        recentImports,
        importsByPlatform,
        isConnected: isImportsConnected,
    };
}
