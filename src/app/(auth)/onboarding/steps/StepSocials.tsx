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
  try {
    const { profileImagePreview: _, ...draftData } = formData;
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

    window.location.href =
      response.authorizeURL;
  } catch (error) {
    console.error(error);

    toast.error(
      `Failed to connect ${providerId}`
    );
  }
};
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-2xl border border-indigo-100 shadow-lg flex flex-col min-h-[600px] w-full max-w-2xl mx-auto relative">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect profiles
        </h2>

        <p className="text-sm text-gray-500">
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

                <span className="text-sm font-semibold text-gray-700">
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
                    : "border-[#6e08b8] text-[#6e08b8] hover:bg-indigo-50"
                )}
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
          className="flex-1 py-4 border-2 border-[#6e08b8] text-[#6e08b8] rounded-full font-bold text-lg hover:bg-indigo-50"
        >
          Go back
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-4 bg-[#6e08b8] text-white hover:bg-[#5a0699] rounded-full font-bold text-lg transition-all disabled:opacity-70 disabled:cursor-wait"
        >
          {isSubmitting ? "Creating..." : "Finish"}
        </button>
      </div>
    </div>
  );
}