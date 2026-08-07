"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FolderHeart } from "lucide-react";
import CollectionFolders from "@/components/bookmarks/CollectionFolders";
import { Button } from "@/components/ui/button";
import { ClaimTypes } from "@/constants/globals";
import { useHttpContext } from "@/providers/HttpContextProvider";

export default function CollectionsPageContent() {
  const t = useTranslations("collections");
  const tCommon = useTranslations("common");
  const { isAuthenticated, user } = useHttpContext();
  const username = user?.[ClaimTypes.UserName] ?? "";

  return (
    <div className="mx-auto w-full max-w-6xl px-2 py-8 sm:px-4">
      <header className="mb-7 flex items-start gap-4">
        <span
          className="rounded-2xl bg-primary/10 p-3 text-primary"
          aria-hidden="true"
        >
          <FolderHeart className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </header>

      {!isAuthenticated || !username ? (
        <section className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <FolderHeart
            className="mx-auto mb-4 size-11 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-card-foreground">
            {t("loginTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("loginHint")}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">{tCommon("login")}</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">{tCommon("signup")}</Link>
            </Button>
          </div>
        </section>
      ) : (
        <CollectionFolders username={username} />
      )}
    </div>
  );
}
