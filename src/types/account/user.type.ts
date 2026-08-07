export type UserType = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean | null;
  gender: string;
  bio: string | null;
  phoneNumber: string | null;
  photo: string;
  coverPhoto: string | null;
}
