"use client";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";
import { apiErrorMessage, parseApiError } from "@/utils/api-error.util";
import { ApiError } from "@/types/error.types";

export const useDeactivateAccount = (
  options?: UseMutationOptions<void, ApiError, void>,
) => {
  const t = useTranslations("errors");
  const tAccount = useTranslations("settings.deleteAccount");

  return useMutation<void, ApiError, void>({
    mutationFn: () => apiClient.Account.deactivateAccountAsync(),
    onSuccess: () => {
      toast.success(tAccount("deactivatedSuccess"));
    },
    onError: (error) => {
      toast.error(apiErrorMessage(parseApiError(error), t));
    },
    ...options,
  });
};
