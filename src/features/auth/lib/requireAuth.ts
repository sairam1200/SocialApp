// src/features/auth/lib/requireAuth.ts

import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/getSession";

export async function requireAuth() {
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}

	return session;
}