// src/app/api/auth/session/route.ts

import { NextResponse } from "next/server";
import {
  getSession,
} from "@/features/auth/lib/getSession";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
    });
  } catch (error) {
    console.error(
      "Session route error:",
      error
    );

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 500 }
    );
  }
}