// import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
// import { UserPhotoPrivacyDto, UserProfileType } from "@/types/account/profile.type";
// import { useAuthUserStore } from "@/store/auth-user.store";
// import toast from "react-hot-toast";
// import { ApiError } from "@/types/error.types";
// import { apiClient } from "@/services/apiClient.service";
// import { parseApiError } from "@/utils/api-error.util";

// export const useGetUser = (username: string, options?: UseQueryOptions<UserProfileType, ApiError>) => {
// 	const { authUser, updateAuthUser } = useAuthUserStore((store) => store);
// 	return useQuery<UserProfileType, ApiError>({
// 		queryKey: ["user", username],
// 		queryFn: async () => {
// 			const profile = await apiClient.User.getUserProfileAsync(username);
// 			const profileWithUsername = { ...profile, username };

// 			if (authUser) {
// 				if (profile?.id === authUser?.id) {
// 					updateAuthUser(profileWithUsername);
// 					return profileWithUsername;
// 				} else {
// 					// Viewing another profile while logged in
// 					return { ...profileWithUsername, isGuestView: true };
// 				}
// 			} else {
// 				// Not logged in: viewing someone else's profile
// 				return { ...profileWithUsername, isGuestView: true };
// 			}
// 		},
// 		...options,
// 	});
// };

// export const useUpdateUser = (
// 	username: string,
// 	options?: UseMutationOptions<void, ApiError, Partial<UserProfileType>>
// ) => {
// 	const queryClient = useQueryClient();

// 	return useMutation({
// 		mutationFn: async (data) => await apiClient.User.updateBasicInfoAsync(data),

// 		onSuccess: async () => {
// 			toast.success("Profile updated successfully");
// 			await queryClient.refetchQueries({ queryKey: ["user", username] });
// 		},

// 		onError: (err) => {
// 			const errorMessage = parseApiError(err)
// 			toast.error(errorMessage);
// 		},

// 		...options,
// 	});
// };

// export const useUpdateProfileImage = (username: string, options?: UseMutationOptions<void, ApiError, FormData>) => {
// 	const queryClient = useQueryClient();

// 	return useMutation({
// 		mutationFn: async (data) => await apiClient.User.updateProfileImageAsync(data),
// 		onSuccess: async () => {
// 			toast.success("Profile Image Updated successfully");
// 			const res = await queryClient.refetchQueries({ queryKey: ["user", username] });
// 			console.log(res, "Success");
// 		},
// 		onError: (err) => {
// 			const errorMessage = parseApiError(err)
// 			toast.error(errorMessage);
// 		},
// 		...options,
// 	});
// };

// export const useUpdateProfileImagePrivacy = (
// 	username: string,
// 	options?: UseMutationOptions<unknown, ApiError, UserPhotoPrivacyDto>
// ) => {
// 	const queryClient = useQueryClient();

// 	return useMutation({
// 		mutationFn: async (data) => await apiClient.User.updateProfileImagePrivacyAsync(data),
// 		onSuccess: async () => {
// 			toast.success("Profile Image Privacy Updated successfully");
// 			await queryClient.refetchQueries({ queryKey: ["user", username] });
// 		},
// 		onError: (err) => {
// 			const errorMessage = parseApiError(err)
// 			toast.error(errorMessage);
// 		},
// 		...options,
// 	});
// };
