/* eslint-disable @typescript-eslint/no-unused-vars */
import { ServiceResponse } from "@/types/serviceResponse.type";
import { UpdateBasicInfoType } from "@/types/auth/authUser.type";
import { Patch, Body, Query, Get, OnError, Delete, Path, Put, Post } from "restfit";
import { CreateManualProfileType, LinkedAccountType, ManualProfileReorderRequestType, ManualProfileType, UpdateManualProfileType, UserPhotoPrivacy, UserProfileType  } from "@/types/account/profile.type";
import { CompleteOnboardingResponseType } from "@/types/auth/Onboarding.type";
export class UserService {

	@OnError((error) => {
		return error.message
	})
	@Get("/user/profile")
	async getUserProfileAsync(@Query("userName") userName: string): Promise<UserProfileType> { return {} as UserProfileType }

	@OnError((error) => {
		return error.message;
	})
	@Patch("/account/basic-info")
	async updateBasicInfoAsync(@Body() data: UpdateBasicInfoType): Promise<ServiceResponse> {
		return {} as ServiceResponse
	}

	@OnError((error) => {
		return error.message;
	})
	@Patch("/account/profile-image")
	
	async updateProfileImageAsync(@Body() formData: FormData): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@OnError((error) => {
		return error.message;
	})
	@Patch("/account/profile-image/privacy")
	async updateProfileImagePrivacyAsync(@Body() data: { privacy: UserPhotoPrivacy }): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@Patch("/account/phone-number/update")
	async updatePhoneNumber(@Query("phoneNumber") phoneNumber: string): Promise<void | null> { }

	@OnError((error) => {
		return error.message;
	})
	@Patch("/account/username/update")
	async updateUsername(@Query("userName") userName: string, @Query("hint") hint?: string): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@Patch("/account/email/update")
	async updateEmail(@Query("email") email: string): Promise<void | null> { }

	@Patch("/user/deactivate")
	async deactivateUser(@Query("userId") userId: string): Promise<void> { }

	@Get("/user/profile/manual-profiles")
	async getManualProfilesAsync(@Query("userName") userName: string): Promise<ManualProfileType[]> {
		return [] as ManualProfileType[];
	}

	@Get("/user/profile/linked-accounts")
	async getLinkedAccountsAsync(@Query("userName") userName: string): Promise<LinkedAccountType[]> {
		return [] as LinkedAccountType[];
	}

	@OnError((error) => {
		return error.message
	})
	@Post("/user/profile/manual-profile")
	async createManualProfileAsync(@Body() body: CreateManualProfileType): Promise<ManualProfileType> {
		return {} as ManualProfileType;
	}

	@OnError((error) => {
		return error.message;
	})
	@Put("/user/profile/manual-profile")
	async updateManualProfileAsync(@Body() body: UpdateManualProfileType): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@OnError((error) => {
		return error.message;
	})
	@Patch("/user/profile/manual-profile/re-order")
	async reorderManualProfileAsync(@Body() body: ManualProfileReorderRequestType): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@OnError((error) => {
		return error.message
	})
	@Delete("/user/profile/manual-profile/{id}")
	async removeManualProfileAsync(@Query("id") id: string): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}
	@OnError((error) => {
		return error.message;
	})
	@Post("/account/onboarding/complete")
async completeOnboardingAsync(
  @Body() body: {
    fullName: string;
    email?: string;
    bio: string;
    location: string;
    interests: string[];
    connectedAccounts: Record<string, string>;
  }
): Promise<CompleteOnboardingResponseType> {
  return {} as CompleteOnboardingResponseType;
}
}
