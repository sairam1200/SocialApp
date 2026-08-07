import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/ui/error-state";

/**
 * The 404 page.
 *
 * Without this file Next.js serves its own built-in page: unstyled black-on-white, the word
 * "404" and "This page could not be found", in English, with no way onward and no sign it
 * belongs to Gaddr. It also ignores the dark theme entirely, so a user browsing at night got
 * a full-brightness white flash.
 *
 * A server component on purpose. There is nothing interactive here, so it needs no JavaScript
 * to render, and `getTranslations` gives us the locale the middleware already resolved —
 * meaning a Swedish visitor gets a Swedish 404, which the built-in page could never do.
 */
export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <ErrorState
      glyph="404"
      title={t("notFoundTitle")}
      description={t("notFoundBody")}
      actions={[
        // Search first, deliberately. A 404 usually means someone was looking for something
        // specific, and search is the product's front door — more useful than the home page.
        { label: t("goToSearch"), href: "/discover", variant: "primary" },
        { label: t("goHome"), href: "/", variant: "secondary" },
      ]}
    />
  );
}
