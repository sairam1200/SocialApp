/* "use client";

import * as React from "react";

type Provider = "google" | "facebook";

const API_BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin
    : process.env.NEXT_PUBLIC_API_BASE_URL || "";

const APP_POST_LOGIN_PATH = process.env.NEXT_PUBLIC_APP_POST_LOGIN_PATH || "/";

function buildStartUrl(provider: Provider) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const redirect = encodeURIComponent(`${origin}/auth/social/callback`);
  return `${API_BASE}/auth/social/${provider}?redirect_uri=${redirect}`;
}

function openPopup(url: string) {
  const w = 500,
    h = 600;
  const dualLeft = window.screenLeft ?? window.screenX ?? 0;
  const dualTop = window.screenTop ?? window.screenY ?? 0;
  const width =
    window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const height =
    window.innerHeight ??
    document.documentElement.clientHeight ??
    screen.height;
  const left = dualLeft + (width - w) / 2;
  const top = dualTop + (height - h) / 2;
  const features = `scrollbars=yes,resizable=yes,width=${w},height=${h},left=${left},top=${top}`;
  const win = window.open(url, "Sign in", features);
  if (win) win.focus();
  return win;
}

export default function SocialAuthButtons() {
  const [loadingProvider, setLoadingProvider] = React.useState<Provider | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== "oauth_result") return;
      setLoadingProvider(null);
      if (e.data.ok) {
        window.location.href = APP_POST_LOGIN_PATH;
      } else {
        setError(e.data.error || "Sign-in failed.");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function begin(provider: Provider, e?: React.MouseEvent) {
    setError(null);
    setLoadingProvider(provider);

    // Alt-click to simulate an error when using the mock route
    const force = e?.altKey ? "&force=error" : "";
    const url = buildStartUrl(provider) + force;

    const isPopupHostile =
      /iPad|iPhone|iPod/.test(navigator.userAgent) || window.innerWidth < 480;

    if (isPopupHostile) {
      window.location.href = url;
      return;
    }
    const win = openPopup(url);
    if (!win) window.location.href = url;
  }

  const disabled = !!loadingProvider;

  return (
    <div className="space-y-2" aria-busy={disabled}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={(e) => begin("google", e)}
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          {loadingProvider === "google" ? "Opening…" : "Sign in with Google"}
        </button>

        <button
          type="button"
          onClick={(e) => begin("facebook", e)}
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FacebookIcon />
          {loadingProvider === "facebook"
            ? "Opening…"
            : "Sign in with Facebook"}
        </button>
      </div>

      {loadingProvider && (
        <p className="text-xs text-gray-500">
          If nothing happens, your browser may have blocked popups. We’ll fall
          back to a full-page redirect automatically.
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.8 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.1 29.2 4 24 4 16.1 4 9.1 8.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.8-2 13.1-5.2l-6.1-5c-2 1.5-4.6 2.4-7 2.4-5.3 0-9.6-3.4-11.2-8l-6.7 5.1C9 39.4 15.9 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-3.1 5.1-5.9 6.3l6.1 5C38.7 36.9 44 31 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078V12.07h3.047V9.413c0-3.007 1.792-4.668 4.533-4.668 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.955.928-1.955 1.88v2.257h3.328l-.532 3.493h-2.796V24C19.612 23.093 24 18.1 24 12.073z"
      />
    </svg>
  );
}
 */