"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AxiosError } from "axios";

import { useOAuthEvents } from "@/hooks/useOAuthEvents";
import {
  platforms,
  type Platform,
  type PlatformId,
} from "@/constants/platforms";
import { apiClient } from "@/services/apiClient.service";
import { LinkedAccountType, ManualProfileType } from "@/types/account/profile.type";
import { toast } from "react-hot-toast";
type UseOAuthFlowParams = {
  username: string;
  onOpenManageDialog: () => void;

  setPlatformsState: Dispatch<SetStateAction<Platform[]>>;
  setLinkedAccounts: Dispatch<SetStateAction<LinkedAccountType[]>>;
  manualProfiles: ManualProfileType[];
  setManualProfiles: Dispatch<SetStateAction<ManualProfileType[]>>;
};

type UseOAuthFlowResult = {
  startOAuthFlow: (platformId: PlatformId) => Promise<void>;
  handleImportFromSuccess: () => Promise<void>;

  openConnectSuccess: boolean;
  oauthPlatformId: PlatformId | null;
  oauthAccount: LinkedAccountType | null;
  closeConnectDialog: () => void;
  skipConnectDialog: () => void;

  openConnectFailed: boolean;
  failedPlatformName: string | null;
  closeFailedDialog: () => void;
};

type ConnectIntegrationResult = {
  authorizeURL: string;
};

function extractAuthorizeUrlFromError(
  error: AxiosError<unknown>
): string | null {
  const data = error.response?.data as unknown;

  if (
    data &&
    typeof data === "object" &&
    "authorizeURL" in data &&
    typeof (data as { authorizeURL?: unknown }).authorizeURL === "string"
  ) {
    return (data as { authorizeURL: string }).authorizeURL;
  }

  const headers = error.response?.headers as
    | Record<string, unknown>
    | undefined;

  const location = headers?.location ?? headers?.Location;

  if (typeof location === "string") {
    return location;
  }

  return null;
}

async function getAuthorizeUrl(platform: string): Promise<string> {
  try {
    const result = (await apiClient.Integration.connect(
      platform
    )) as ConnectIntegrationResult;

    if (result?.authorizeURL && typeof result.authorizeURL === "string") {
      return result.authorizeURL;
    }

    console.error(
      "connectIntegration: no authorizeURL in 2xx response",
      result
    );
    throw new Error("No authorizeURL in response");
  } catch (err: unknown) {
    const error = err as AxiosError<unknown>;
    const status = error.response?.status;

    if (status === 302) {
      const authorizeURL = extractAuthorizeUrlFromError(error);
      if (authorizeURL) {
        return authorizeURL;
      }

      console.error(
        "connectIntegration: got 302 but no authorizeURL in data or Location header",
        {
          data: error.response?.data,
          headers: error.response?.headers,
        }
      );
    } else if (status === 404) {
      console.error(
        `connectIntegration: endpoint for "${platform}" does not exist (404)`
      );
    }

    console.error("connectIntegration failed:", err);
    throw err;
  }
}

export function useOAuthFlow(params: UseOAuthFlowParams): UseOAuthFlowResult {
  const {
    username,
    onOpenManageDialog,
    setPlatformsState,
    setLinkedAccounts,
    manualProfiles,
    setManualProfiles,
  } = params;

  const [openConnectSuccess, setOpenConnectSuccess] = useState(false);
  const [oauthPlatformId, setOauthPlatformId] = useState<PlatformId | null>(
    null
  );
  const [oauthAccount, setOauthAccount] = useState<LinkedAccountType | null>(
    null
  );

  const [openConnectFailed, setOpenConnectFailed] = useState(false);
  const [failedPlatformName, setFailedPlatformName] = useState<string | null>(
    null
  );

  // SUCCESS
  const handleOAuthSuccess = (platformId: PlatformId) => {
    (async () => {
      try {
        const latestLinkedRaw = await apiClient.User.getLinkedAccountsAsync(
          username
        );
        const latestLinked = latestLinkedRaw ?? [];

        setLinkedAccounts(latestLinked);

        const toRemove = manualProfiles.filter(
          (mp) => mp.platform.toLowerCase() === platformId.toLowerCase()
        );

        for (const mp of toRemove) {
          try {
            await apiClient.User.removeManualProfileAsync(mp.id);
          } catch (error) {
            console.warn(
              "Failed to delete manual profile during OAuth promote:",
              error
            );
          }
        }

        if (toRemove.length) {
          setManualProfiles((prev) =>
            prev.filter(
              (mp) => mp.platform.toLowerCase() !== platformId.toLowerCase()
            )
          );
        }

        const account =
          latestLinked.find(
            (a) => a.platform.toLowerCase() === platformId.toLowerCase()
          ) ?? null;

        setPlatformsState((prev) =>
          prev.map((p) =>
            p.id === platformId
              ? {
                ...p,
                connected: true,
                connectionMethod: "import",
                importStatus: account?.isImported
                  ? "imported"
                  : "not_imported",
              }
              : p
          )
        );

        setOauthPlatformId(platformId);
        setOauthAccount(account);
        setOpenConnectSuccess(true);
      } catch (e) {
        console.error("Failed to refresh after OAuth success:", e);
      }
    })();
  };

  // FAIL
  const handleOAuthFail = (platformId: PlatformId) => {
    const def = platforms.find((p) => p.id === platformId);
    setFailedPlatformName(def?.name ?? platformId);
    setOpenConnectFailed(true);
  };

  useOAuthEvents(setPlatformsState, handleOAuthSuccess, handleOAuthFail);

  // START FLOW
  async function startOAuthFlow(platformId: PlatformId): Promise<void> {
    try {
      const authorizeURL = await getAuthorizeUrl(platformId);
      if (!authorizeURL) {
        console.error("No authorizeURL returned for", platformId);
        return;
      }

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authorizeURL,
        `oauth_${platformId}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        // fallback — full redirect
        window.location.href = authorizeURL;
      }
    } catch (e) {
      console.error("startOAuthFlow failed:", e);
    }
  }

  // IMPORT after success dialog
  async function handleImportFromSuccess(): Promise<void> {
    console.log("IMPORT BUTTON CLICKED");
    if (!oauthPlatformId) return;

    setPlatformsState((prev) =>
      prev.map((p) =>
        p.id === oauthPlatformId ? { ...p, importStatus: "importing" } : p
      )
    );

    try {
  await apiClient.Integration.importContent(
    oauthPlatformId,
    {}
  );
} catch (e: unknown) {
  const error = e as AxiosError<{ title?: string }>;

  const title =
    error.response?.data?.title;

  if (title === "INSTAGRAM_RECONNECT_REQUIRED") {
    toast.error("Instagram connection expired. Please reconnect.");
    await startOAuthFlow("instagram");
    return;
  }

  console.error("Import failed:", error);
}
    try {
      const latestLinkedRaw = await apiClient.User.getLinkedAccountsAsync(
        username
      );
      const latestLinked = latestLinkedRaw ?? [];

      setLinkedAccounts(latestLinked);

      setPlatformsState((prev) =>
        prev.map((p) => {
          if (p.id !== oauthPlatformId) return p;
          const acc = latestLinked.find(
            (a) => a.platform.toLowerCase() === p.id.toLowerCase()
          );
          return {
            ...p,
            connected: true,
            connectionMethod: "import",
            importStatus: acc?.isImported ? "imported" : "not_imported",
          };
        })
      );
    } catch (e) {
      console.error("Failed to refresh linked accounts after import:", e);
    }

    closeConnectDialog();
    onOpenManageDialog();
  }

  function closeConnectDialog() {
    setOpenConnectSuccess(false);
    setOauthPlatformId(null);
    setOauthAccount(null);
  }

  function skipConnectDialog() {
    closeConnectDialog();
    onOpenManageDialog();
  }

  function closeFailedDialog() {
    setOpenConnectFailed(false);
    setFailedPlatformName(null);
  }

  return {
    startOAuthFlow,
    handleImportFromSuccess,
    openConnectSuccess,
    oauthPlatformId,
    oauthAccount,
    closeConnectDialog,
    skipConnectDialog,
    openConnectFailed,
    failedPlatformName,
    closeFailedDialog,
  };
}
