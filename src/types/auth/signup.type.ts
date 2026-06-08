import { ServiceResponse } from "../serviceResponse.type";

export type RegisterRequestType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userAgent: string;
  ipAddress: string;
  // userName: string;
  // gender: string;
};

export type RegisterResponseType = ServiceResponse & {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  isEmailVerified: boolean;
  phoneNumber: string;
  photo: string;
};

export type VerifyEmailRequestType = {
  email: string;
  code: string;
}

export type VerifyEmailResponseType = {
  success: boolean;
  message: string;
};

export type SendVerificationRequestType = {
  userAgent: string;
  ipAddress: string;
  email: string;
}

