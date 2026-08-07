"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/ui/error-state";

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
	const t = useTranslations("errors");

  return (
		<ErrorState
			title={t("errorTitle")}
			description={t("errorBody")}
			reference={error.digest}
			actions={[{ label: t("tryAgain"), onClick: reset }]}
		/>
  );
}
