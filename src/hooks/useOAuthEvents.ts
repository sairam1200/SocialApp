import { useEffect } from "react";
import { Platform, PlatformId } from "@/constants/platforms";

export function useOAuthEvents(
  setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>,
  onSuccess: (platformId: PlatformId) => void,
  onFail: (platformId: PlatformId) => void
) {
  useEffect(() => {
    const handleSuccess = (e: Event) => {
      const custom = e as CustomEvent<{ platform: string }>;
      const platformId = custom.detail.platform as PlatformId;

      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId
            ? {
                ...p,
                connected: true,
                connectionMethod: "import",
                importStatus: "not_imported",
              }
            : p
        )
      );

      onSuccess(platformId);
    };

    const handleFail = (e: Event) => {
      const custom = e as CustomEvent<{ platform: string }>;
      const platformId = custom.detail.platform as PlatformId;

      onFail(platformId);
    };

    window.addEventListener("oauth_success", handleSuccess);
    window.addEventListener("oauth_failed", handleFail);

    return () => {
      window.removeEventListener("oauth_success", handleSuccess);
      window.removeEventListener("oauth_failed", handleFail);
    };
  }, [setPlatforms, onSuccess, onFail]);
}
