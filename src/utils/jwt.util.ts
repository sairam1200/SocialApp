// src/features/auth/utils/jwt.ts

export function getTokenExpiry(
  token: string
): number | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return payload.exp ?? null;
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(
  token: string,
  bufferSeconds = 300
) {
  const exp =
    getTokenExpiry(token);

  if (!exp) return true;

  const now =
    Math.floor(Date.now() / 1000);

  return exp - now < bufferSeconds;
}