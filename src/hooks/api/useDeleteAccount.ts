"use client";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";
import { parseApiError } from "@/utils/api-error.util";
import { ApiError } from "@/types/error.types";

export const useDeleteAccount = (
  options?: UseMutationOptions<void, ApiError, string>
) => {
  return useMutation<void, ApiError, string>({
    mutationFn: async (userId: string) => {
      return apiClient.User.deactivateUser(userId);
    },

    onSuccess: () => {
      toast.success("Your account has been deleted");
    },

    onError: (error) => {
      const message = parseApiError(error);
      toast.error(message || "Error deleting account");
    },

    ...options,
  });
};

// For testing purposes
// export const useDeleteAccount = (
//   options?: UseMutationOptions<void, ApiError, string>
// ) => {
//   return useMutation<void, ApiError, string>({
//     mutationFn: async () => {
//       console.log("DELETE ACCOUNT CALLED — TEST ONLY");
//       return;
//   },
//   });
// };