import { ServiceResponse } from "../serviceResponse.type";

export type TwoFactorSetupResponseType = {
  secret: string;
  qrcode: string;
  message?: string;
};

export type ChangePasswordRequestType = {
  currentPassword: string;
  newPassword: string;
  userAgent: string;
  ipAddress: string;
  deviceId: string;
};