import { ServiceResponse } from "../serviceResponse.type";

export type ForgotPasswordRequestType = {
  email: string;
  userAgent: string;
  ipAddress: string;
  deviceId: string;
}

export type VerifyCodeRequestType = {
  email: string;
  code: string;
  purpose: string;
};

export type VerifyCodeResponseType = ServiceResponse & {
  isValid: boolean;
  expiresIn: number;
}
