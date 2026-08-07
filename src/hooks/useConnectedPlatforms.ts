import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { useHttpContext } from "@/providers/HttpContextProvider";

export function useConnectedPlatforms() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useHttpContext();

  useEffect(() => {
    if (!user) {
      setConnectedPlatforms([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const result = await apiClient.Integration.getLinkedAccounts();
        if (!cancelled) {
          setConnectedPlatforms(result.platforms ?? []);
        }
      } catch {
        if (!cancelled) {
          setConnectedPlatforms([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { connectedPlatforms, isLoading };
}
