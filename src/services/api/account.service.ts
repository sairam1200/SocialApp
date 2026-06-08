/* eslint-disable @typescript-eslint/no-unused-vars */
import { SuggestUsernameResponseType } from "@/types/auth/suggest-username.type";
import { RegisterRequestType, RegisterResponseType, SendVerificationRequestType, VerifyEmailRequestType, VerifyEmailResponseType } from "@/types/auth/signup.type";
import { EmailInUseResponseType } from "@/types/auth/email.type";
import { OnError, Post, Body, Query, Header, ResponseInterceptor } from "restfit";
import { ForgotPasswordRequestType, VerifyCodeRequestType, VerifyCodeResponseType } from "@/types/auth/forgotPassword.type";
import { ResetPasswordRequestType } from "@/types/auth/reset-password.type";
import { ChangePasswordRequestType, TwoFactorSetupResponseType } from "@/types/account/password.type";
import { ServiceResponse } from "@/types/serviceResponse.type";

export class AccountService {

  @OnError((error) => {
    return error.message;
  })
  @Post<RegisterResponseType>("/account/register")
  async registerNewUserAsync(
    @Body() RegisterPayload: RegisterRequestType,
    @Header("x-turnstile-token") turnstileToken?: string
  ): Promise<RegisterResponseType> {
    return {} as RegisterResponseType;
  }

  @Post<VerifyEmailResponseType>("/account/email/verify")
  async VerifyEmailAsync(@Body() VerifyEmailPayload: VerifyEmailRequestType): Promise<VerifyEmailResponseType> {
    return {} as VerifyEmailResponseType;
  }

  @OnError((error) => {
    return error.message;
  })
  @Post<void>("/account/email/send-verification")
  async sendVerificationAsync(@Body() sendVerificationPayload: SendVerificationRequestType): Promise<ServiceResponse> {
    return {} as ServiceResponse;
  }

  @Post<SuggestUsernameResponseType>("/account/username/suggest")
  async suggestUsernameAsync(
    @Query("userName") userName: string,
    @Query("hint") hint?: string
  ): Promise<SuggestUsernameResponseType> {
    return {} as SuggestUsernameResponseType;
  }

  @ResponseInterceptor((response) => {
    const data = {
      result: response.data,
      success: response.isSuccessStatusCode(),
      message: !response.isSuccessStatusCode() ? response.data?.title || "Something went wrong" : ""
    };

    return response.createSuccess(data, 200);
  })
  @Post("/account/email/in-use")
  async emailInUseAsync(@Query("email") email: string): Promise<EmailInUseResponseType> {
    return {} as EmailInUseResponseType;
  }

  @OnError((error) => {
    return error.message;
  })
  @Post<void>("/account/forgot-password")
  async forgotPasswordAsync(@Body() forgotPasswordPayload: ForgotPasswordRequestType): Promise<ServiceResponse> {
    return {} as ServiceResponse;
  }

  @OnError((error) => {
    return error.message;
  })
  @Post<VerifyCodeResponseType>("/account/verify-code")
  async verifyCodeAsync(@Body() verifyCodePayload: VerifyCodeRequestType): Promise<VerifyCodeResponseType> {
    return {} as VerifyCodeResponseType;
  }

  @Post<void>("/account/reset-password")
  async resetPasswordAsync(@Body() resetPasswordPayload: ResetPasswordRequestType): Promise<void> { }

  @Post("/account/2fa/setup")
  async twoFactorSetupAsync(): Promise<TwoFactorSetupResponseType> {
    return {} as TwoFactorSetupResponseType;
  }

  @Post("/account/2fa/enable")
  async twoFactorEnableAsync(
    @Body() body: { secret: string; userOTP: string }
  ): Promise<{ message: string }> {
    return {} as { message: string };
  }

  @Post("/account/2fa/disable")
  async twoFactorDisableAsync(): Promise<{ message: string }> {
    return {} as { message: string };
  }

  @Post<void>("/account/change-password")
  async changePasswordAsync(@Body() body: ChangePasswordRequestType): Promise<void> {
    return;
  }

  
}

