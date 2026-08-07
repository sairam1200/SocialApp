/* eslint-disable @typescript-eslint/no-unused-vars */
import { COOKIE_NAMES } from "@/constants/globals";
import { TokenResponseType, TokenRequestType, RefreshTokenRequestType, LogoutRequestType, CurrentUserResponseType } from "@/types/auth/login.type";
import { deleteCookie } from "@/utils/cookie.util";
import { Body, Get, Header, OnError, Path, Post, Query } from "restfit";

export class TokenService {

  @OnError((error) => {
    return error.message;
  })
  @Post<TokenResponseType>("/auth/access-token")
  async loginAsync(@Body() loginPayload: TokenRequestType, @Header("x-turnstile-token") turnstileToken?: string): Promise<TokenResponseType> { return {} as TokenResponseType }
  
@Get<CurrentUserResponseType>("/auth/current")
async currentAsync(@Header("Authorization") authorization?: string): Promise<CurrentUserResponseType> {
  return {} as CurrentUserResponseType;
}
  @OnError((error) => {
    return error.message;
  })
  @Get<{ authorizeURL: string }>("/auth/{platform}/connect")
  async connectAsync<T extends { authorizeURL: string } = { authorizeURL: string }>(
    @Path("platform") platform: string,
    @Query("deviceId") deviceId: string,
    @Query("userAgent") userAgent: string,
    @Query("ipAddress") ipAddress: string,
    @Header("x-redirect-url") redirectUrl?: string
  ): Promise<T> {
    return {} as T;
  }

  @OnError([400, 401], async (error) => {
    await deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
    await deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);

    return error.message;
  })
  @Post<RefreshTokenRequestType>("/auth/refresh-access-token")
  async refreshTokenAsync(@Body() refreshPayload: RefreshTokenRequestType): Promise<TokenResponseType> { return {} as TokenResponseType }

  @OnError<null>(401, (error) => {
    return null;
  })
  @Post<void>("/auth/logout")
  async logoutAsync(@Body() logoutPayload: LogoutRequestType): Promise<void> { }

  @OnError(400, (error) => {
    return null;
  })
  @OnError((error) => {
    return error.message;
  })
  @Get<TokenResponseType>("/auth/{platform}/connect-callback")
  async callbackAsync<T extends TokenResponseType = TokenResponseType>(
    @Path("platform") platform: string,
    @Query("code") code: string,
    @Query("state") state: string,
    @Header("x-redirect-url") redirectUrl?: string
  ): Promise<T> {
    return {} as T;
  }
} 
