import { useMutation, UseMutationOptions, useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { UserPhotoPrivacyDto, UserProfileType } from "@/types/account/profile.type";
import { useAuthUserStore } from "@/store/auth-user.store";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/services/apiClient.service";
import { parseApiError } from "@/utils/api-error.util";
import { useFollowStore } from "@/store/follow.store";
import type { ApiError } from "@/types/error.types";
import type { ServiceResponse } from "@/types/serviceResponse.type";

export const useGetUser = (username: string, options?: UseQueryOptions<UserProfileType, ApiError>) => {
	const { authUser, updateAuthUser } = useAuthUserStore((store) => store);
	const setFollow = useFollowStore((s) => s.setFollow);

	return useQuery<UserProfileType, ApiError>({
		queryKey: queryKeys.userProfile(username),
		queryFn: async () => {
			const profile = await apiClient.User.getUserProfileAsync(username);
			const profileWithUsername = { ...profile, username };

			if (profile.id && typeof (profile as UserProfileType).isFollowing === "boolean" && typeof (profile as UserProfileType).followersCount === "number") {
				setFollow(profile.id, {
					isFollowing: (profile as UserProfileType).isFollowing!,
					followersCount: (profile as UserProfileType).followersCount,
				});
			}

			if (authUser) {
				if (profile?.id === authUser?.id) {
					updateAuthUser({
						id: profile.id,
						username,
						email: profile.email ?? "",
						firstName: profile.firstName,
						lastName: profile.lastName,
						gender: profile.gender,
						bio: profile.bio ?? "",
					});
					return { ...profileWithUsername, isGuestView: false };
				} else {
					return { ...profileWithUsername, isGuestView: true };
				}
			} else {
				return { ...profileWithUsername, isGuestView: true };
			}
		},
		...options,
	});
};

export const useUpdateUser = (
	username: string,
	options?: UseMutationOptions<ServiceResponse, ApiError, Partial<UserProfileType>>
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data) => {
			const { firstName, lastName, gender, bio } = data;
			return await apiClient.User.updateBasicInfoAsync({
				firstName,
				lastName,
				gender,
				bio: bio ?? undefined,
			});
		},
		onSuccess: async () => {
			toast.success("Profile updated successfully");
			await queryClient.refetchQueries({ queryKey: queryKeys.userProfile(username) });
		},
		onError: (err) => {
			toast.error(parseApiError(err));
		},
		...options,
	});
};

export const useUpdateProfileImage = (username: string, options?: UseMutationOptions<ServiceResponse, ApiError, FormData>) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data) => await apiClient.User.updateProfileImageAsync(data),
		onSuccess: async () => {
			toast.success("Profile Image Updated successfully");
			await queryClient.refetchQueries({ queryKey: queryKeys.userProfile(username) });
		},
		onError: (err) => {
			toast.error(parseApiError(err));
		},
		...options,
	});
};

export const useUpdateProfileImagePrivacy = (
	username: string,
	options?: UseMutationOptions<ServiceResponse, ApiError, UserPhotoPrivacyDto>
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data) => await apiClient.User.updateProfileImagePrivacyAsync(data),
		onSuccess: async () => {
			toast.success("Profile Image Privacy Updated successfully");
			await queryClient.refetchQueries({ queryKey: queryKeys.userProfile(username) });
		},
		onError: (err) => {
			toast.error(parseApiError(err));
		},
		...options,
	});
};
