import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/constants/globals";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const token =
      (await cookies()).get(
        COOKIE_NAMES.ACCESS_TOKEN
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${process.env.AUTH_API_URL}/api/v1/account/onboarding/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
      }
    );
/* 
    const data =
      await response.json();

   */    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid backend response",
          raw: text,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      data,
      {
        status: response.status,
      }
    );
    ////
  } catch {
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to complete onboarding",
      },
      { status: 500 }
    );
  }
}