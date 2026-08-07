/* eslint-disable @typescript-eslint/no-unused-vars */
import { ServiceResponse } from "@/types/serviceResponse.type";
import { UpdateBasicInfoType } from "@/types/auth/authUser.type";
import { Patch, Body, Query, Get, Delete, Path, Put, Post } from "restfit";
import { CreateManualProfileType, DiscoverCreatorsResponse, LinkedAccountType, ManualProfileReorderRequestType, ManualProfileType, PublicProfileModel, UpdateManualProfileType, UserPhotoPrivacy, UserProfileType  } from "@/types/account/profile.type";
import { CompleteOnboardingResponseType } from "@/types/auth/Onboarding.type";
export class UserService {

	@Get("/user/profile")
	async getUserProfileAsync(@Query("userName") userName: string): Promise<UserProfileType> { return {} as UserProfileType }

	@Get("/user/profile/public")
	async getPublicProfileAsync(@Query("userName") userName: string): Promise<PublicProfileModel> {
		return {} as PublicProfileModel;
	}

	@Patch("/account/basic-info")
	async updateBasicInfoAsync(@Body() data: UpdateBasicInfoType): Promise<ServiceResponse> {
		return {} as ServiceResponse
	}

	@Patch("/account/profile-image")
	
	async updateProfileImageAsync(@Body() formData: FormData): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@Patch("/account/cover-image")
	async updateCoverImageAsync(@Body() formData: FormData): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@Patch("/account/profile-image/privacy")
	async updateProfileImagePrivacyAsync(@Body() data: { privacy: UserPhotoPrivacy }): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@Patch("/account/phone-number/update")
	async updatePhoneNumber(@Query("phoneNumber") phoneNumber: string): Promise<void | null> { }

	@Patch("/account/username/update")
	async updateUsername(@Query("userName") userName: string, @Query("hint") hint?: string): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@Patch("/account/email/update")
	async updateEmail(@Query("email") email: string): Promise<void | null> { }

	@Patch("/user/deactivate")
	async deactivateUser(@Query("userId") userId: string): Promise<void> { }

	@Post("/user/{userId}/follow")
	async followUser(@Path("userId") userId: string): Promise<void> { }

	@Delete("/user/{userId}/unfollow")
	async unfollowUser(@Path("userId") userId: string): Promise<void> { }

	@Get("/discover/creators")
	async getDiscoverCreators(
		@Query("page") page?: number,
		@Query("limit") limit?: number
	): Promise<DiscoverCreatorsResponse> {
		return {
			profiles: [],
			page: page ?? 1,
			limit: limit ?? 12,
			totalResults: 0,
			hasNextPage: false,
		};
	}

	@Get("/user/profile/manual-profiles")
	async getManualProfilesAsync(@Query("userName") userName: string): Promise<ManualProfileType[]> {
		return [] as ManualProfileType[];
	}

	@Get("/user/profile/linked-accounts")
	async getLinkedAccountsAsync(@Query("userName") userName: string): Promise<LinkedAccountType[]> {
		return [] as LinkedAccountType[];
	}

	@Post("/user/profile/manual-profile")
	async createManualProfileAsync(@Body() body: CreateManualProfileType): Promise<ManualProfileType> {
		return {} as ManualProfileType;
	}

	@Put("/user/profile/manual-profile")
	async updateManualProfileAsync(@Body() body: UpdateManualProfileType): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@Patch("/user/profile/manual-profile/re-order")
	async reorderManualProfileAsync(@Body() body: ManualProfileReorderRequestType): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}

	@Delete("/user/profile/manual-profile/{id}")
	async removeManualProfileAsync(@Query("id") id: string): Promise<ServiceResponse> {
		return {} as ServiceResponse;
	}
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

@Patch("/account/notification-preferences")
async updateNotificationPreferencesAsync(
  @Body() body: { emailFrequency?: "immediate" | "daily" | "weekly" }
): Promise<ServiceResponse> {
  return {} as ServiceResponse;
}
}
