import { ApiError } from "@/types/error.types";

export function parseApiError(error: ApiError): string {
  if (!error) return "Something went wrong";

  const data = error.response?.data;

  // Case 1: backend returned a simple string
  if (typeof data === "string") {
    return data;
  }

  // Case 2: backend returned object
  if (data && typeof data === "object") {
    return (
      data.title ||
      data.detail ||
      data.type ||
      error.message ||
      "An unexpected error occurred"
    );
  }

  // Fallback
  return error.message || "An unexpected error occurred";
}
