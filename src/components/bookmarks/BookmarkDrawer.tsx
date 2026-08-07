"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FolderPlus, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";
import type { AddBookmarkContentBody } from "@/services/api/bookmark.service";
import {
  findPlaylistByName,
  normalizePlaylist,
  normalizePlaylists,
} from "@/services/api/playlist.service";
import { ClaimTypes } from "@/constants/globals";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const QUICK_NAMES = ["Travel", "School", "Riding", "Vacation", "Summer"];

type BookmarkDrawerProps = {
  open: boolean;
  onClose: () => void;
  content: AddBookmarkContentBody;
  onSaved?: () => void;
};

export default function BookmarkDrawer({
  open,
  onClose,
  content,
  onSaved,
}: BookmarkDrawerProps) {
  const { user } = useHttpContext();
  const username = user?.[ClaimTypes.UserName] ?? "";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const playlists = useQuery({
    queryKey: ["playlists", username],
    queryFn: () => apiClient.Playlist.getPlaylists(username),
    enabled: open && Boolean(username),
  });

  const ownedPlaylists = useMemo(() => {
    const normalizedUsername = username.trim().toLocaleLowerCase();
    return normalizePlaylists(playlists.data).filter(
      (playlist) =>
        playlist.owner.userName.trim().toLocaleLowerCase() === normalizedUsername,
    );
  }, [playlists.data, username]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return ownedPlaylists.filter(
      (playlist) => !needle || playlist.name.toLowerCase().includes(needle),
    );
  }, [ownedPlaylists, search]);
  const selected = ownedPlaylists.find(
    (playlist) => playlist.referenceId === selectedReferenceId,
  );

  useEffect(() => {
    if (!open) {
      setSearch("");
      setNewName("");
      setSelectedReferenceId(null);
    }
  }, [open]);

  const saveTo = async (referenceId: string, name: string) => {
    setSaving(referenceId);
    try {
      await apiClient.Playlist.addContentToOwnedCollection(name, content);
      onSaved?.();
      toast.success(`Saved to ${name}`);
      onClose();
    } catch {
      toast.error("This bookmark could not be added to that collection.");
    } finally {
      setSaving(null);
    }
  };

  const createAndSave = async (requestedName: string) => {
    const name = requestedName.trim();
    if (!name) return;
    const existing = findPlaylistByName(ownedPlaylists, name);
    if (existing) {
      await saveTo(existing.referenceId, existing.name);
      return;
    }
    setSaving(`new:${name}`);
    try {
      const response = await apiClient.Playlist.createPlaylist({
        name,
        playlistType: "User",
      });
      const created = normalizePlaylist(response);
      if (!created) throw new Error("Collection response did not include a reference ID");
      await apiClient.Playlist.addContentToOwnedCollection(created.name, content);
      await queryClient.invalidateQueries({ queryKey: ["playlists", username] });
      onSaved?.();
      setNewName("");
      toast.success(`Created ${name} and saved the bookmark`);
      onClose();
    } catch {
      toast.error("The collection could not be created.");
    } finally {
      setSaving(null);
    }
  };

  const chooseQuickName = (name: string) => {
    const existing = findPlaylistByName(ownedPlaylists, name);
    if (existing) {
      setSelectedReferenceId(existing.referenceId);
      setNewName("");
      return;
    }
    setSelectedReferenceId(null);
    setNewName(name);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        data-result-action="bookmark-dialog"
        className="sm:max-w-lg"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Save bookmark to a collection</DialogTitle>
          <DialogDescription>
            Choose one of your collections, or create a new one with any name.
          </DialogDescription>
        </DialogHeader>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search collections"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />

        <div className="max-h-56 space-y-2 overflow-y-auto">
          {playlists.isLoading ? (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading collections
            </p>
          ) : visible.length > 0 ? (
            visible.map((playlist) => (
              <button
                key={playlist.referenceId}
                type="button"
                disabled={saving !== null}
                aria-pressed={selectedReferenceId === playlist.referenceId}
                onClick={() => setSelectedReferenceId(playlist.referenceId)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  selectedReferenceId === playlist.referenceId
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <span>
                  <span className="block font-medium">{playlist.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {playlist.contents?.length ?? 0} bookmarks
                  </span>
                </span>
                {selectedReferenceId === playlist.referenceId ? (
                  <span className="rounded-full bg-primary p-1 text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                ) : (
                  <Plus className="size-4 text-primary" />
                )}
              </button>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No collections yet. Create one below.
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick collection names</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                disabled={saving !== null}
                onClick={() => chooseQuickName(name)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  findPlaylistByName(ownedPlaylists, name)?.referenceId === selectedReferenceId
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 border-t border-border pt-4">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void createAndSave(newName);
            }}
            maxLength={255}
            placeholder="Any collection name"
            className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button
            type="button"
            disabled={!newName.trim() || saving !== null}
            onClick={() => void createAndSave(newName)}
          >
            <FolderPlus className="size-4" /> Create & save
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {selected ? `Selected: ${selected.name}` : "Select a collection above"}
          </p>
          <Button
            type="button"
            disabled={!selected || saving !== null}
            onClick={() => selected && void saveTo(selected.referenceId, selected.name)}
          >
            {saving === selected?.referenceId ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Save to collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
