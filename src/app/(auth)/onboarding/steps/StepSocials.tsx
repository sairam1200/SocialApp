"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { cn } from "@/utils/cn.util";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import type { ProfileFormData } from "./types";
import { SOCIAL_PLATFORMS } from "./types";
import { apiClient } from "@/services/apiClient.service";

interface StepThreeSocialsProps {
  formData: ProfileFormData;
  setFormData: Dispatch<SetStateAction<ProfileFormData>>;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function StepThreeSocials({
  formData,
  setFormData,
  isSubmitting,
  onBack,
  onSubmit,
}: StepThreeSocialsProps) {
  useEffect(() => {
    const handleSuccess = (event: Event) => {
      const { platform } = (event as CustomEvent<{ platform?: string }>).detail ?? {};
      if (!platform) return;
      setFormData((previous) => ({
        ...previous,
        connectedAccounts: {
          ...previous.connectedAccounts,
          [platform]: "connected",
        },
      }));
      toast.success(
        `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully`,
      );
    };
    const handleFailure = (event: Event) => {
      const detail = (event as CustomEvent<{ error?: string }>).detail;
      toast.error(detail?.error || "Account connection failed");
    };

    window.addEventListener("oauth_success", handleSuccess);
    window.addEventListener("oauth_failed", handleFailure);
    return () => {
      window.removeEventListener("oauth_success", handleSuccess);
      window.removeEventListener("oauth_failed", handleFailure);
    };
  }, [setFormData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const provider = params.get("provider");
    const connected = params.get("connected");
    const error = params.get("error");

    if (error) {
      toast.error(decodeURIComponent(error));

      params.delete("error");
      params.delete("provider");
      params.delete("connected");

      const cleanUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");

      window.history.replaceState({}, "", cleanUrl);

      return;
    }

    if (provider && connected === "true") {
      setFormData((prev) => ({
        ...prev,
        connectedAccounts: {
          ...prev.connectedAccounts,
          [provider]: "connected",
        },
      }));

      toast.success(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully`
      );

      params.delete("provider");
      params.delete("connected");

      const cleanUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");

      window.history.replaceState({}, "", cleanUrl);
    }
  }, [setFormData]);

  const handleConnect = async (
  providerId: string
) => {
  const popup = window.open(
    "",
    `gaddr-${providerId}-oauth`,
    "popup=yes,width=560,height=760,resizable=yes,scrollbars=yes",
  );

  if (!popup) {
    toast.error("Allow pop-ups to connect an external profile.");
    return;
  }

  try {
    const draftData = { ...formData };
    delete draftData.profileImagePreview;
    sessionStorage.setItem(
      "onboarding_draft",
      JSON.stringify(draftData)
    );

    const response =
      await apiClient.Integration.connect(
        providerId
      );

    if (!response.authorizeURL) {
      throw new Error(
        "No authorization URL returned"
      );
    }

    popup.location.href = response.authorizeURL;
    popup.focus();
  } catch {
    popup.close();
    toast.error(
      `Failed to connect ${providerId}`
    );
  }
};
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card p-8 rounded-2xl border border-indigo-100 shadow-lg flex flex-col min-h-[600px] w-full max-w-2xl mx-auto relative">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Connect profiles
        </h2>

        <p className="text-sm text-muted-foreground">
          Link your personal profiles to share content.
        </p>
      </div>

      <div className="space-y-3 grow overflow-y-auto pr-2">
        {SOCIAL_PLATFORMS.map((social) => {
          const isConnected =
            !!formData.connectedAccounts[social.id];

          return (
            <div
              key={social.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-2xl hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    social.bg
                  )}
                >
                  <social.icon
                    size={18}
                    className={social.color}
                  />
                </div>

                <span className="text-sm font-semibold text-muted-foreground">
                  {social.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isConnected) return;
                  handleConnect(social.id);
                }}
                className={cn(
                  "flex items-center gap-1 px-5 py-1.5 border rounded-full text-xs font-bold transition-colors",
                  isConnected
                    ? "bg-green-100 border-green-200 text-green-700"
                    : "border-primary text-primary hover:bg-accent"
                )}
                aria-label={isConnected ? `${social.name} connected` : `Connect ${social.name}`}
              >
                {isConnected ? (
                  <>
                    Connected
                    <Check size={14} className="ml-1" />
                  </>
                ) : (
                  <>
                    Connect
                    <span className="text-lg leading-none ml-1">
                      +
                    </span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-8 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-accent"
          aria-label="Go back to previous step"
        >
          Go back
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-4 bg-primary text-white hover:bg-primary/80 rounded-full font-bold text-lg transition-all disabled:opacity-70 disabled:cursor-wait"
          aria-label="Finish onboarding"
        >
          {isSubmitting ? "Creating..." : "Finish"}
        </button>
      </div>
    </div>
  );
}
