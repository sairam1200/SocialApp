import { Body, Delete, Get, Path, Post, Put, Query } from "restfit";
import type { AddBookmarkContentBody } from "./bookmark.service";

export interface PlaylistContentSummary {
  id: string;
  playlistReferenceId: string;
  userContentId?: string;
  contentId: string;
  type: string;
  title: string;
  platform: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  contentUrl?: string | null;
  createdOn?: string | null;
  addedBy?: {
    id: string;
    role: string;
    userName: string;
    displayName: string;
  };
}

export interface PlaylistSummary {
  id: string;
  referenceId: string;
  name: string;
  description?: string;
  playlistType?: string;
  systemType?: string;
  contents?: PlaylistContentSummary[];
  owner: { id: string; userName: string; displayName: string };
}

export function normalizePlaylists(value: unknown): PlaylistSummary[] {
  if (Array.isArray(value)) return value as PlaylistSummary[];
  if (!value || typeof value !== "object") return [];
  const wrapped = value as { result?: unknown; data?: unknown };
  if (Array.isArray(wrapped.result)) return wrapped.result as PlaylistSummary[];
  if (Array.isArray(wrapped.data)) return wrapped.data as PlaylistSummary[];
  return [];
}

export function normalizePlaylist(value: unknown): PlaylistSummary | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<PlaylistSummary> & {
    result?: unknown;
    data?: unknown;
  };
  if (typeof candidate.referenceId === "string") {
    return candidate as PlaylistSummary;
  }
  return normalizePlaylist(candidate.result) ?? normalizePlaylist(candidate.data);
}

export function findPlaylistByName(
  value: unknown,
  name: string,
  ownerNameOrId?: string,
): PlaylistSummary | undefined {
  const normalizedName = name.trim().toLocaleLowerCase();
  if (!normalizedName) return undefined;
  const normalizedOwner = ownerNameOrId?.trim().toLocaleLowerCase();
  return normalizePlaylists(value).find(
    (playlist) => {
      const sameName = playlist.name.trim().toLocaleLowerCase() === normalizedName;
      if (!sameName || !normalizedOwner) return sameName;
      return (
        playlist.owner.id.toLocaleLowerCase() === normalizedOwner ||
        playlist.owner.userName.toLocaleLowerCase() === normalizedOwner
      );
    },
  );
}

export class PlaylistService {
  @Get<PlaylistSummary[]>("/playlists/{username}")
  async getPlaylists(@Path("username") username: string): Promise<PlaylistSummary[]> {
    return [];
  }

  @Get<PlaylistSummary>("/playlist/get-by-id")
  async getPlaylist(
    @Query("playlistReferenceId") playlistReferenceId: string,
  ): Promise<PlaylistSummary> {
    void playlistReferenceId;
    return {} as PlaylistSummary;
  }

  @Post<PlaylistSummary>("/playlist")
  async createPlaylist(
    @Body() body: { name: string; description?: string; playlistType?: "User" },
  ): Promise<PlaylistSummary> {
    return {} as PlaylistSummary;
  }

  @Delete("/playlist/{referenceId}")
  async deletePlaylist(
    @Path("referenceId") referenceId: string,
  ): Promise<void> {
    return;
  }

  @Put("/playlist/{referenceId}/content/add")
  async addContent(
    @Path("referenceId") referenceId: string,
    @Body() body: AddBookmarkContentBody,
  ): Promise<void> {
    return;
  }

  @Put("/playlist/owned/{name}/content/add")
  async addContentToOwnedCollection(
    @Path("name") name: string,
    @Body() body: AddBookmarkContentBody,
  ): Promise<void> {
    return;
  }
}
