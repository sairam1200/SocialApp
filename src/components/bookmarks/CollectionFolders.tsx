"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Folder, FolderPlus, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";
import {
  findPlaylistByName,
  normalizePlaylists,
} from "@/services/api/playlist.service";
import { Button } from "@/components/ui/button";

const QUICK_COLLECTION_NAMES = [
  "Travel",
  "School",
  "Riding",
  "Vacation",
  "Summer",
];

export default function CollectionFolders({ username }: { username: string }) {
  const t = useTranslations("collections");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingReferenceId, setDeletingReferenceId] = useState<string | null>(null);
  const collections = useQuery({
    queryKey: ["playlists", username],
    queryFn: () => apiClient.Playlist.getPlaylists(username),
    enabled: Boolean(username),
  });

  const ownedCollections = useMemo(() => {
    const owner = username.trim().toLocaleLowerCase();
    return normalizePlaylists(collections.data).filter(
      (collection) =>
        collection.owner.userName.trim().toLocaleLowerCase() === owner,
    );
  }, [collections.data, username]);

  const create = async (requestedName: string) => {
    const nextName = requestedName.trim();
    if (!nextName || findPlaylistByName(ownedCollections, nextName)) return;

    setCreating(true);
    try {
      await apiClient.Playlist.createPlaylist({
        name: nextName,
        playlistType: "User",
      });
      setName("");
      await queryClient.invalidateQueries({
        queryKey: ["playlists", username],
      });
      toast.success(t("created"));
    } catch {
      toast.error(t("createError"));
    } finally {
      setCreating(false);
    }
  };

  const remove = async (referenceId: string, collectionName: string) => {
    if (!window.confirm(t("deleteConfirm", { name: collectionName }))) {
      return;
    }

    setDeletingReferenceId(referenceId);
    try {
      await apiClient.Playlist.deletePlaylist(referenceId);
      await queryClient.invalidateQueries({ queryKey: ["playlists", username] });
      toast.success(t("deleted"));
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setDeletingReferenceId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <span
            className="rounded-xl bg-primary/10 p-2 text-primary"
            aria-hidden="true"
          >
            <FolderPlus className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-card-foreground">
              {t("createTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("createHint")}
            </p>
          </div>
        </div>

        <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">
          {t("quickNames")}
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_COLLECTION_NAMES.map((quickName) => (
            <button
              key={quickName}
              type="button"
              disabled={
                creating ||
                Boolean(findPlaylistByName(ownedCollections, quickName))
              }
              onClick={() => void create(quickName)}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              {quickName}
            </button>
          ))}
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void create(name);
          }}
        >
          <label className="sr-only" htmlFor="collection-name">
            {t("namePlaceholder")}
          </label>
          <input
            id="collection-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            placeholder={t("namePlaceholder")}
            className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" disabled={creating || !name.trim()}>
            {creating ? <Loader2 className="size-4 animate-spin" /> : null}
            {creating ? t("creating") : t("create")}
          </Button>
        </form>
      </section>

      {collections.isLoading ? (
        <div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={t("title")}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="relative animate-pulse pt-4">
              <div className="absolute left-5 top-0 h-6 w-24 rounded-t-xl bg-muted" />
              <div className="h-44 rounded-2xl border border-border bg-muted" />
            </div>
          ))}
        </div>
      ) : collections.isError ? (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          <Button
            className="mt-4"
            type="button"
            variant="outline"
            onClick={() => void collections.refetch()}
          >
            {tCommon("retry")}
          </Button>
        </div>
      ) : ownedCollections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-12 text-center">
          <Folder
            className="mx-auto mb-3 size-10 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ownedCollections.map((collection) => (
            <article
              key={collection.referenceId}
              className="group relative pt-4"
            >
              <span
                className="absolute left-5 top-0 h-7 w-28 rounded-t-xl border border-b-0 border-border bg-primary/10 transition-colors group-hover:bg-primary/15"
                aria-hidden="true"
              />
              <Link
                href={`/collections/${encodeURIComponent(collection.referenceId)}`}
                aria-label={t("folderLabel", { name: collection.name })}
                className="relative flex min-h-44 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition outline-none group-hover:-translate-y-0.5 group-hover:border-primary/50 group-hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Folder
                  className="size-9 fill-primary/10 text-primary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="mt-4 line-clamp-1 pr-8 text-lg font-semibold text-card-foreground">
                  {collection.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("bookmarks", { count: collection.contents?.length ?? 0 })}
                </p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-primary">
                  {t("open")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
              {collection.playlistType !== "System" && collection.systemType !== "Bookmark" ? (
                <button
                  type="button"
                  aria-label={`Delete ${collection.name}`}
                  title={`Delete ${collection.name}`}
                  disabled={deletingReferenceId === collection.referenceId}
                  onClick={() => void remove(collection.referenceId, collection.name)}
                  className="absolute right-3 top-8 z-10 rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-wait disabled:opacity-50"
                >
                  {deletingReferenceId === collection.referenceId ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-4" aria-hidden="true" />
                  )}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
