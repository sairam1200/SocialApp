import { DEVICE_ID_KEY } from "@/constants/globals";

/**
 * Generate a fallback UUID if crypto.randomUUID is unavailable
 */
function generateFallbackId(): string {
	return (
		Date.now().toString(36) +
		Math.random().toString(36).slice(2) +
		Math.random().toString(36).slice(2)
	);
}

/**
 * Gets or creates a device ID stored in localStorage
 */
export function getDeviceId(): string {
	if (typeof window === "undefined") {
		return "";
	}

	let deviceId = localStorage.getItem(DEVICE_ID_KEY);

	if (!deviceId) {
		if (
			typeof window.crypto !== "undefined" &&
			typeof window.crypto.randomUUID === "function"
		) {
			deviceId = window.crypto.randomUUID();
		} else {
			deviceId = generateFallbackId();
		}

		localStorage.setItem(DEVICE_ID_KEY, deviceId);
	}

	return deviceId;
}

/**
 * Gets existing device ID without creating one
 */
export function getDeviceIdOrNull(): string | null {
	if (typeof window === "undefined") {
		return null;
	}

	return localStorage.getItem(DEVICE_ID_KEY);
}