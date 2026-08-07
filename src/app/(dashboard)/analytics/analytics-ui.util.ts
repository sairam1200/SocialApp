export type AnalyticsErrorKind =
  "permissionDenied" | "permissionRequired" | "loadFailed";

interface ApiErrorShape {
  message?: string;
  status?: number;
  statusCode?: number;
  code?: string;
  response?: {
    status?: number;
    data?: { code?: string; title?: string; message?: string };
  };
}

export function getAnalyticsErrorKind(error: unknown): AnalyticsErrorKind {
  const apiError = error as ApiErrorShape;
  const status =
    apiError?.response?.status ?? apiError?.status ?? apiError?.statusCode;
  const code = [
    apiError?.code,
    apiError?.message,
    apiError?.response?.data?.code,
    apiError?.response?.data?.title,
    apiError?.response?.data?.message,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toUpperCase();

  if (status === 403 || /PERMISSION|FORBIDDEN|MISSING[_ ]SCOPES?/.test(code)) {
    return "permissionDenied";
  }
  if (status === 401 || /RECONNECT_REQUIRED|TOKEN[_ ]EXPIRED/.test(code)) {
    return "permissionRequired";
  }
  return "loadFailed";
}
