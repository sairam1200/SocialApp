"use client";

import { useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";

export default function CallbackClient() {
  const params = useParams();
  const search = useSearchParams();
  const platform = params.platform as string;

  useEffect(() => {
    async function run() {
      const code = search.get("code");
      const state = search.get("state");

      if (!code || !state) {
        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", { detail: { platform } })
          );
          window.close();
        }
        return;
      }

      // const result = await handleOAuthCallback(platform, code, state);

      if (window.opener) {
        window.opener.dispatchEvent(
          // new CustomEvent(
          //   result.success ? "oauth_success" : "oauth_failed",
          //   { detail: { platform } }
          // )
        );
        window.close();
      }
    }

    void run();
  }, [platform, search]);

  return (
    <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
      Completing connection…
    </div>
  );
}
