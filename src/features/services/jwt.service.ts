
import { SignJWT, jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET is missing");
}

const secret = new TextEncoder().encode(JWT_SECRET);

const DEFAULT_EXPIRY = "1d";
const REMEMBER_ME_EXPIRY = "30d";

export type SessionPayload = JWTPayload & {
	sub: string;
	email?: string;
	name?: string;
	picture?: string;
	role?: string;
	provider?: string;
};

type SignSessionOptions = {
	rememberMe?: boolean;
};

function getExpiry(options?: SignSessionOptions) {
	return options?.rememberMe
		? REMEMBER_ME_EXPIRY
		: DEFAULT_EXPIRY;
}

export async function signSessionToken(
	payload: SessionPayload,
	options?: SignSessionOptions
): Promise<string> {
	return await new SignJWT(payload)
		.setProtectedHeader({
			alg: "HS256",
		})
		.setIssuedAt()
		.setExpirationTime(getExpiry(options))
		.sign(secret);
}

export async function verifySessionToken(
	token: string
): Promise<SessionPayload> {
	const { payload } = await jwtVerify(token, secret);

	return payload as SessionPayload;
}

export async function isValidSessionToken(
	token: string
): Promise<boolean> {
	try {
		await verifySessionToken(token);
		return true;
	} catch {
		return false;
	}
}

export function decodeSessionToken(
	token: string
): SessionPayload | null {
	try {
		const parts = token.split(".");

		if (parts.length !== 3) {
			return null;
		}

		const payload = JSON.parse(
			Buffer.from(parts[1], "base64url").toString()
		);

		return payload as SessionPayload;
	} catch {
		return null;
	}
}