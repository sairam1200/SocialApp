import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  setSessionCookie,
} from "@/features/auth/services/cookie.service";

export async function POST(
  req: NextRequest
) {
  const body =
    await req.json();

  const response =
    NextResponse.json({
      success: true,
    });

  setSessionCookie(
    body.access_token
  );

  return response;
}