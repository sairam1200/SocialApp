import { ClaimTypes } from "@/constants/globals";

export interface JwtPayload {
  exp: number;
  [key: string]: unknown;
  [ClaimTypes.Email]: string;
  [ClaimTypes.UserId]: string;
  [ClaimTypes.UserName]: string;
  [ClaimTypes.UserType]: string;
  [ClaimTypes.FullName]: string;
  [ClaimTypes.GivenName]: string;
  [ClaimTypes.FamilyName]: string;
  [ClaimTypes.ProfileImage]: string;
  [ClaimTypes.SecurityStamp]: string;
  [ClaimTypes.ConcurrencyStamp]: string;
}