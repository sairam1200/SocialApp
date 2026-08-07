import type {
  FacebookTokenResponse,
  GoogleTokenResponse,
  FacebookUserProfile,
  GoogleUserProfile,
  InstagramTokenResponse,
  InstagramUserProfile,
  YouTubeTokenResponse,
  YouTubeChannelResponse,
  TikTokTokenResponse,
  TikTokUserResponse,
} from "@/types/auth/Oauth.type";

// src/features/auth/services/oauth.service.ts

export function buildGoogleOAuthUrl(
	state: string,
	returnTo?: string
) {
	const finalState = returnTo
		? `${state}:${encodeURIComponent(
				returnTo
		  )}`
		: state;

	const redirectUri =
		`${process.env.APP_URL}/api/oauth/google/callback`;

	const params =
		new URLSearchParams({
			client_id:
				process.env
					.GOOGLE_CLIENT_ID!,
			redirect_uri:
				redirectUri,
			response_type:
				"code",
			scope:
				"openid email profile",
			access_type:
				"offline",
			prompt:
				"consent",
			state:
				finalState,
		});

	return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
export async function exchangeGoogleCodeForToken(
	code: string
): Promise<GoogleTokenResponse> {
	const redirectUri =
		`${process.env.APP_URL}/api/oauth/google/callback`;

	const response = await fetch(
		"https://oauth2.googleapis.com/token",
		{
			method: "POST",
			headers: {
				"Content-Type":
					"application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id:
					process.env.GOOGLE_CLIENT_ID!,
				client_secret:
					process.env
						.GOOGLE_CLIENT_SECRET!,
				code,
				grant_type:
					"authorization_code",
				redirect_uri:
					redirectUri,
			}),
		}
	);

	if (!response.ok) {
		throw new Error(
			"Failed to exchange OAuth code"
		);
	}

	return response.json();
}
export async function fetchGoogleUserProfile(
  accessToken: string
): Promise<GoogleUserProfile> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google profile");
  }

  return response.json();
}
export function buildFacebookOAuthUrl(returnTo?: string) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
    response_type: "code",
    scope: "email,public_profile",
  });

  if (returnTo) {
    params.set("state", returnTo);
  }

  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeFacebookCodeForToken(
  code: string
): Promise<FacebookTokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Facebook token exchange failed");
  }

  return data;
}

export async function fetchFacebookUserProfile(
  accessToken: string
): Promise<FacebookUserProfile> {
  const params = new URLSearchParams({
    fields: "id,name,email,picture",
    access_token: accessToken,
  });

  const response = await fetch(
    `https://graph.facebook.com/me?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Facebook profile fetch failed");
  }

  return data;
}
export function buildInstagramOAuthUrl(returnTo?: string) {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    scope: "user_profile,user_media",
    response_type: "code",
  });

  if (returnTo) {
    params.set("state", returnTo);
  }

  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}
export async function exchangeInstagramCodeForToken(
  code: string
): Promise<InstagramTokenResponse> {
  const response = await fetch(
    "https://api.instagram.com/oauth/access_token",
    {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
        code,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Instagram token exchange failed");
  }

  return data;
}
export async function fetchInstagramUserProfile(
  accessToken: string
): Promise<InstagramUserProfile> {
  const params = new URLSearchParams({
    fields: "id,username,account_type,media_count",
    access_token: accessToken,
  });

  const response = await fetch(
    `https://graph.instagram.com/me?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Instagram profile fetch failed");
  }

  return data;
}
export function buildYouTubeOAuthUrl(returnTo?: string) {
  const params = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    redirect_uri: process.env.YOUTUBE_REDIRECT_URI!,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope:
      "https://www.googleapis.com/auth/youtube.readonly",
  });

  if (returnTo) {
    params.set("state", returnTo);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
export async function exchangeYouTubeCodeForToken(
  code: string
): Promise<YouTubeTokenResponse> {
  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.YOUTUBE_CLIENT_ID!,
        client_secret:
          process.env.YOUTUBE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri:
          process.env.YOUTUBE_REDIRECT_URI!,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("YouTube token exchange failed");
  }

  return data;
}
export async function fetchYouTubeChannelProfile(
  accessToken: string
) {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "YouTube profile fetch failed"
    );
  }

  return data;
}
export function buildTikTokOAuthUrl(returnTo?: string) {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_ID!,
    redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    response_type: "code",
    scope: "user.info.basic",
  });

  if (returnTo) {
    params.set("state", returnTo);
  }

  const url = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

  return url;
}
export async function exchangeTikTokCodeForToken(
  code: string
): Promise<TikTokTokenResponse> {
  const response = await fetch(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_ID!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("TikTok token exchange failed");
  }

  return data;
}
export async function fetchTikTokUserProfile(
  accessToken: string
): Promise<TikTokUserResponse> {
  const response = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("TikTok profile fetch failed");
  }

  return data;
}