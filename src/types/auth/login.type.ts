import { ServiceResponse } from "../serviceResponse.type";

export type TokenRequestType = {
  email: string;
  password: string;
  userAgent: string;
  deviceId: string;
  ipAddress: string;
}

export type TokenResponseType = ServiceResponse & {
  succeeded: boolean;
  message: string;
  access_token?: string;
  refresh_token?: string;
  refreshTokenExpiryTime?: number;
  isLockedOut: boolean;
  isTwoFARequired: boolean;
  onboardingCompleted?: boolean;
}
export type CurrentUserResponseType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  onboardingStep: string;
};

export type GoogleOAuthTokenResponseType = TokenResponseType &  {
  googleAccessToken: string;
  googleAccessTokenExpiresIn: number;
}

export type FacebookOAuthTokenResponseType = TokenResponseType & {
  facebookAccessToken: string;
  facebookAccessTokenExpiresIn: number;
}

export type RefreshTokenRequestType = {
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  deviceId: string;
}

export type FacebookConnectRequestType = {
  userAgent: string;
  ipAddress: string;
  deviceId: string;
}

export type FacebookConnectResponseType = ServiceResponse & {
  authorizeURL: string;
}

export type GoogleConnectRequestType = {
  userAgent: string;
  ipAddress: string;
  deviceId: string;
}

export type GoogleConnectResponseType = ServiceResponse & {
  authorizeURL: string;
}

export type LogoutRequestType = {
  deviceId: string;
}

export type OAuthCallbackRequestType = {
  code: string;
  state?: string;
}

export type FacebookCallbackRequestType = {
  code: string;
  state?: string;
}