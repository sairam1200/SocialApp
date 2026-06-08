/**
 * Gets the client IP. Tries same-origin /api/ip first (not blocked by ad blockers).
 * Falls back to external APIs; these may be blocked by ad blockers (ERR_BLOCKED_BY_CLIENT).
 */
const ipApis = [
  { url: "/api/ip", getIp: (d: { ip?: string }) => d.ip },
  { url: "https://api.ipify.org?format=json", getIp: (d: { ip?: string }) => d.ip },
  { url: "https://ipinfo.io/json", getIp: (d: { ip?: string }) => d.ip },
  { url: "https://ifconfig.me/all.json", getIp: (d: { client_ip?: string }) => d.client_ip },
];

export const getIpAddress = async (): Promise<string> => {
  for (const { url, getIp } of ipApis) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as Record<string, string | undefined>;
      const ip = getIp(data);
      if (ip) return ip;
    } catch {
      // ignore and try next (e.g. ERR_BLOCKED_BY_CLIENT from ad blockers on external APIs)
    }
  }
  return "0.0.0.0";
};
