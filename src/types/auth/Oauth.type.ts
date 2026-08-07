import type { JWTPayload } from "jose";

export interface SessionPayload extends JWTPayload {
	email: string;
	name: string;
	picture?: string;
	provider: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

export interface GoogleUserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}
export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FacebookUserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}
export interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  account_type?: string;
  media_count?: number;
}
export interface YouTubeTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface YouTubeChannelResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      thumbnails?: {
        default?: {
          url: string;
        };
      };
    };
  }>;
}
export interface TikTokTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_token?: string;
  refresh_expires_in?: number;
  scope?: string;
  token_type?: string;
}

export interface TikTokUserResponse {
  data: {
    user: {
      open_id: string;
      display_name: string;
      avatar_url?: string;
    };
  };
}