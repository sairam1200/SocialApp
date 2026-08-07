export const ClaimTypes = {
  UserId: "http://gaddr.com/claims/sub",
  Email: "http://gaddr.com/claims/email",
  TwoFARequired: "http://gaddr.com/claims/2fa-required",
  SecurityStamp: "http://gaddr.com/claims/security-stamp",
  ConcurrencyStamp: "http://gaddr.com/claims/concurrency-stamp",
  UserType: "http://gaddr.com/claims/usertype",
  UserName: "http://gaddr.com/claims/username",
  ProfileImage: "http://gaddr.com/claims/profile-picture",
  GivenName: "http://gaddr.com/claims/givenname",
  FamilyName: "http://gaddr.com/claims/familyname",
  FullName: "http://gaddr.com/claims/fullname",
  Roles: "http://gaddr.com/claims/roles",
  Permission: "permission",
  AccountType: "http://gaddr.com/claims/account-type",

} as const;

export type ClaimTypes = typeof ClaimTypes[keyof typeof ClaimTypes];

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  GOOGLE_ACCESS_TOKEN: "google_access_token",
  FACEBOOK_ACCESS_TOKEN: "facebook_access_token",
  INSTAGRAM_ACCESS_TOKEN: "instagram_access_token",
  TWITTER_ACCESS_TOKEN: "twitter_access_token",
  PINTEREST_ACCESS_TOKEN:"pinterest_access_token",
  LINKEDIN_ACCESS_TOKEN:"linkedin_access_token",
  TIKTOK_ACCESS_TOKEN: "tiktok_access_token",
} as const;

export const DEVICE_ID_KEY = "deviceId";

export const LOCAL_STORAGE_KEYS = {
  REMEMBERED_USER_INFO: "remembered_user_info",
} as const;
