// types/account/onboardingRequest.type.ts

export interface SaveStep1Request {
  username: string;
  bio: string;
  
}

export interface SaveStep2Request {
  topicIds: string[];
}

export interface SaveStep3Request {
  connectedAccounts: Record<string, string>;
}

export interface CompleteStep4Request {
  confirmed: boolean;
}