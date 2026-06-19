export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  maxAge?: number;
  expires?: Date;
}

interface SetCookieParams {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): Promise<void> {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
    return;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const {
    httpOnly = true,
    secure = process.env.NODE_ENV === "production",
    sameSite = "lax",
    path = "/",
    maxAge,
    expires,
  } = options;

  cookieStore.set(name, value, {
    httpOnly,
    secure,
    sameSite,
    path,
    ...(maxAge !== undefined ? { maxAge } : {}),
    ...(expires !== undefined ? { expires } : {}),
  });
}

export async function getCookie(
  name: string
): Promise<string | null> {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(
      new RegExp(`(^| )${name}=([^;]+)`)
    );

    return match
      ? decodeURIComponent(match[2])
      : null;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return cookieStore.get(name)?.value ?? null;
}

export async function deleteCookie(
  name: string
): Promise<void> {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    return;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  cookieStore.delete(name);
}

export async function setCookies(
  cookieParams: SetCookieParams[]
): Promise<void> {
  if (typeof window !== "undefined") {
    for (const { name, value } of cookieParams) {
      document.cookie =
        `${name}=${encodeURIComponent(value)};` +
        `path=/;` +
        `SameSite=Lax;` +
        (location.protocol === "https:"
          ? "Secure;"                                   
          : "");
    }
    return;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  for (const {
    name,
    value,
    options = {},
  } of cookieParams) {
    const {
      httpOnly = true,
      secure = process.env.NODE_ENV === "production",
      sameSite = "strict",
      path = "/",
      maxAge,
      expires,
    } = options;

    cookieStore.set(name, value, {
      httpOnly,
      secure,
      sameSite,
      path,
      ...(maxAge !== undefined
        ? { maxAge }
        : {}),
      ...(expires !== undefined
        ? { expires }
        : {}),
    });
  }
}