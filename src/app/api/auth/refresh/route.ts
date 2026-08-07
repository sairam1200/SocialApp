import { NextRequest, NextResponse } from "next/server";

import { apiClient } from "@/services/apiClient.service";

import {
  setSessionCookie,
  setRefreshCookie,
  REFRESH_COOKIE_NAME,
} from "@/features/auth/services/cookie.service";

import { cookies } from "next/headers";

import {
  TokenResponseType,
} from "@/types/auth/login.type";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const cookieStore =
      await cookies();

    const refreshToken =
      cookieStore.get(
        REFRESH_COOKIE_NAME
      )?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Refresh token not found",
        },
        {
          status: 401,
        }
      );
    }

    const forwardedFor =
      req.headers.get(
        "x-forwarded-for"
      );

    const ipAddress =
      forwardedFor
        ?.split(",")[0]
        ?.trim() ||
      req.headers.get(
        "cf-connecting-ip"
      ) ||
      "";

    const userAgent =
      req.headers.get(
        "user-agent"
      ) || "";

    const refreshResult =
      (await apiClient.Token.refreshTokenAsync(
        {
          refreshToken,
          deviceId:
            body.deviceId,
          userAgent,
          ipAddress,
        }
      )) as TokenResponseType;

    if (
      !refreshResult ||
      !refreshResult.succeeded ||
      !refreshResult.access_token
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Refresh failed",
        },
        {
          status: 401,
        }
      );
    }

    const response =
      NextResponse.json({
        success: true,
      });

  await setSessionCookie(
  refreshResult.access_token
);

    if (
      refreshResult.refresh_token &&
      refreshResult.refreshTokenExpiryTime
    ) {
      await setRefreshCookie(
        refreshResult.refresh_token
      );
    }

    return response;

  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Refresh failed",
      },
      {
        status: 500,
      }
    );
  }
}