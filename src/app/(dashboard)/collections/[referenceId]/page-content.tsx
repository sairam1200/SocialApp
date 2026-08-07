"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import ContentFeedCard from "@/components/card/ContentFeedCard";
import { SearchResultInteraction } from "@/components/search/SearchResultInteraction";
import { Button } from "@/components/ui/button";
import { ClaimTypes } from "@/constants/globals";
import { normalizeBookmarkContent } from "@/lib/card-helpers";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { apiClient } from "@/services/apiClient.service";
import { normalizePlaylist } from "@/services/api/playlist.service";

function CollectionDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl border border-border bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-[440px] rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function CollectionDetailPageContent({
  referenceId,
}: {
  referenceId: string;
}) {
  const t = useTranslations("collections");
  const tCommon = useTranslations("common");
  const { isAuthenticated, user } = useHttpContext();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const username = user?.[ClaimTypes.UserName] ?? "";
  const query = useQuery({
    queryKey: ["playlist", referenceId],
    queryFn: () => apiClient.Playlist.getPlaylist(referenceId),
    enabled: isAuthenticated && Boolean(referenceId),
  });
  const playlist = normalizePlaylist(query.data);
  const isOwner =
    playlist?.owner.userName.trim().toLocaleLowerCase() ===
    username.trim().toLocaleLowerCase();
  const canDelete =
    isOwner &&
    playlist?.playlistType !== "System" &&
    playlist?.systemType !== "Bookmark";

  const remove = async () => {
    if (
      !playlist ||
      !window.confirm(t("deleteConfirm", { name: playlist.name }))
    ) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.Playlist.deletePlaylist(playlist.referenceId);
      router.push("/collections");
    } catch {
      window.alert(t("deleteError"));
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-2 py-8 sm:px-4">
      <nav aria-label={t("title")} className="mb-5">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("back")}
        </Link>
      </nav>

      {!isAuthenticated ? (
        <section className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <FolderOpen
            className="mx-auto mb-4 size-11 text-muted-foreground"
            aria-hidden="true"
          />
          <h1 className="text-xl font-semibold text-card-foreground">
            {t("loginTitle")}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("loginHint")}
          </p>
          <Button className="mt-5" asChild>
            <Link href="/login">{tCommon("login")}</Link>
          </Button>
        </section>
      ) : query.isLoading ? (
        <CollectionDetailSkeleton />
      ) : query.isError || !playlist || !isOwner ? (
        <section className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          <Button
            className="mt-4"
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            {tCommon("retry")}
          </Button>
        </section>
      ) : (
        <div className="space-y-7">
          <header className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <span
              className="rounded-2xl bg-primary/10 p-3 text-primary"
              aria-hidden="true"
            >
              <FolderOpen
                className="size-8 fill-primary/10"
                strokeWidth={1.5}
              />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-card-foreground">
                {playlist.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("bookmarks", { count: playlist.contents?.length ?? 0 })}
              </p>
              {playlist.description ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {playlist.description}
                </p>
              ) : null}
            </div>
            {canDelete ? (
              <button
                type="button"
                onClick={() => void remove()}
                disabled={deleting}
                className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-wait disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="size-4" aria-hidden="true" />
                )}
                {t("delete")}
              </button>
            ) : null}
          </header>

          {!playlist.contents?.length ? (
            <section className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
              <FolderOpen
                className="mx-auto mb-4 size-10 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="font-semibold text-foreground">
                {t("emptyFolder")}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {t("emptyFolderHint")}
              </p>
              <Button className="mt-5" asChild>
                <Link href="/discover">{t("discover")}</Link>
              </Button>
            </section>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {playlist.contents.map((item) => (
                <SearchResultInteraction
                  key={item.id}
                  result={{
                    id: item.id,
                    type: item.type,
                    title: item.title,
                    description: item.description,
                    platform: item.platform,
                    url: item.contentUrl ?? undefined,
                    media: {
                      url: item.contentUrl ?? undefined,
                      thumbnailUrl: item.thumbnailUrl ?? undefined,
                    },
                  }}
                >
                  <ContentFeedCard
                    {...normalizeBookmarkContent(item)}
                    contentId={item.contentId}
                  />
                </SearchResultInteraction>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
