import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
} from "@/features/auth/services/cookie.service";

export async function getSession() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value;



  if (!token) {

    return null;
  }

  const url =
    `${process.env.AUTH_API_URL}/api/v1/auth/current`;



  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );


    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}