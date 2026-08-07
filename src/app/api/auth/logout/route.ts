// src/app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
import { apiClient } from "@/services/apiClient.service";
import { COOKIE_NAMES } from "@/constants/globals";
import { getDeviceId } from "@/utils/deviceId.util";
const deviceId = getDeviceId();
export async function POST() {
	try {
		try {
			await apiClient.Token.logoutAsync({
				deviceId: deviceId, // You can implement a way to generate or retrieve a device ID,
			});
		} catch {
			// ignore backend logout failure
		}

		const response =
			NextResponse.json({	
				success: true,
			});

		response.cookies.set(
			COOKIE_NAMES.ACCESS_TOKEN,
			"",
			{
				expires: new Date(0),
				path: "/",
			}
		);

		response.cookies.set(
			COOKIE_NAMES.REFRESH_TOKEN,
			"",
			{
				expires: new Date(0),
				path: "/",
			}
		);

		return response;
	} catch {
		return NextResponse.json(
			{
				success: false,
				message:
					"Logout failed.",
			},
			{ status: 500 }
		);
	}
}