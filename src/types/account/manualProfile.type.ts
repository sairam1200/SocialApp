export type CreateManualProfileType = {
  url: string;
  platform: string;
  icon: string;
}

export type UpdateManualProfileType = CreateManualProfileType & {
  id: string;
}

export type ManualProfileType = UpdateManualProfileType & {
  displayOrder?: number;
}

export type ManualProfileSearchResponseType = ManualProfileType & {
  user: {
    userName: string;
    firstName: string;
    lastName: string;
    profileImage: string;
  }
}