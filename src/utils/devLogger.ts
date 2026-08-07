type DevLogData = Record<string, unknown>;

/** Development-only diagnostics for multi-platform create-post flows. */
export function devLog(message: string, data: DevLogData = {}): void {
  if (process.env.NODE_ENV !== "development") return;
  console.debug(`[CreatePost] ${message}`, data);
}

export function devError(message: string, data: DevLogData = {}): void {
  if (process.env.NODE_ENV !== "development") return;
  console.error(`[CreatePost] ${message}`, data);
}
