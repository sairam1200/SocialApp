import { ServiceResponse } from "../serviceResponse.type";
export type CompleteOnboardingResponseType =
  ServiceResponse < {
    onboardingCompleted: boolean;
  }>;
  export interface Interest {
    id: string;
    name: string;
    icon: string;
    description?: string;
    isActive?: boolean;
  }
  export type TopicsResponseType = {
  success: boolean;
  data: Interest[];
};export type OnboardingResponseType = {
	success: boolean;
	succeeded?: boolean;
	message?: string;
};
export type OnboardingStatusResponseType = {
  currentStep: string;
  isCompleted: boolean;
  accessToken?: string;
};