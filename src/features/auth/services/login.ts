// src/features/auth/services/login.ts

import { apiClient } from "@/services/apiClient.service";

export type LoginRequest = {
  email: string;
  password: string;
  turnstileToken: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  refreshTokenExpiryTime?: number;
  succeeded: boolean;
  message?: string;
  isTwoFARequired?: boolean;
};

export async function verifyTurnstile(
  token: string,
  ipAddress?: string
): Promise<{ success: boolean }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is missing");
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ipAddress
          ? {
              remoteip: ipAddress,
            }
          : {}),
      }),
    }
  );

  const result = await response.json();

  return {
    success: Boolean(result.success),
  };
}

export async function loginUser(
  request: LoginRequest
): Promise<LoginResponse> {
  const turnstileResult =
    await verifyTurnstile(
      request.turnstileToken,
      request.ipAddress
    );

  if (!turnstileResult.success) {
    throw new Error(
      "Security verification failed."
    );
  }

  const authResponse =
    (await apiClient.Token.loginAsync({
      email: request.email.trim(),
      password: request.password,
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
      deviceId: request.deviceId,
    })) as LoginResponse;

  if (!authResponse) {
    throw new Error(
      "No response received from authentication service."
    );
  }

  if (!authResponse.succeeded) {
    throw new Error(
      authResponse.message ||
        "Invalid login attempt."
    );
  }

  if (!authResponse.access_token) {
    throw new Error(
      "Access token was not returned."
    );
  }

  return authResponse;
}