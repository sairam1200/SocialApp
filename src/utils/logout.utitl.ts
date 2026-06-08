// src/utils/logout.utitl.ts

"use server";

import { apiClient } from "@/services/apiClient.service";
import { cookies } from "next/headers";

export async function logoutFn(
	deviceId: string | null
) {
	try {
		await apiClient.Token.logoutAsync({
			deviceId:
				deviceId ?? "",
		});
	} catch {
		// ignore backend logout failure
	}

	const cookieStore =
		await cookies();

	cookieStore.getAll().forEach(
		(cookie) => {
			cookieStore.delete(
				cookie.name
			);
		}
	);
}