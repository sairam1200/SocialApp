"use client";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";
import { apiErrorMessage, parseApiError } from "@/utils/api-error.util";
import { ApiError } from "@/types/error.types";
import type { AccountDeletionFeedback } from "@/services/api/account.service";

export const useDeleteAccount = (
  options?: UseMutationOptions<void, ApiError, AccountDeletionFeedback>
) => {
  const t = useTranslations("errors");
  const tAccount = useTranslations("settings.deleteAccount");

  return useMutation<void, ApiError, AccountDeletionFeedback>({
    mutationFn: async (feedback) => {
      return apiClient.Account.deleteAccountAsync(feedback);
    },

    onSuccess: () => {
      toast.success(tAccount("deletedSuccess"));
    },

    onError: (error) => {
      toast.error(apiErrorMessage(parseApiError(error), t));
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
