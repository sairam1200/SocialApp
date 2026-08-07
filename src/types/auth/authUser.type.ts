export type AuthUserType = {
  id: string;
  username: string;
  email: string;
  isEmailVerified?: boolean;
  phoneNumber?: string;
  givenName?: string;
  familyName?: string;
  fullName?: string;
  photo?: string;
  userType?: string;
  roles?: string[];
  permissions?: string[];
  securityStamp?: string;
  concurrencyStamp?: string;
  twoFARequired?: boolean;
  firstName?: string;
  lastName?: string;
  gender?: string;
  bio?: string;
};

export type UpdateBasicInfoType = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  bio?: string
}