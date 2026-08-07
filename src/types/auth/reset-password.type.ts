export type ResetPasswordRequestType = {
  code: string;
  email: string;
  userAgent: string;
  ipAddress: string;
  deviceId: string;
  newPassword: string;
};
