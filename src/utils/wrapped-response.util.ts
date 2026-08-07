export type WrappedResponse<T> = T | { data: T; success?: boolean };

/** Normalize Restfit's global `wrapResponses` shape at the query boundary. */
export function unwrapResponse<T>(value: WrappedResponse<T>): T {
  if (
    typeof value === "object" &&
    value !== null &&
    "data" in value
  ) {
    return value.data;
  }

  return value;
}
