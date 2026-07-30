import { Get, Put, Delete, Query, Path, Body } from "restfit";
import type { DiscoverContentModel } from "@/types/discover.type";

export interface BookmarkResponse {
  id: string;
  contents: DiscoverContentModel[];
}

export interface AddBookmarkContentBody {
  contentId: string;
  type?: string;
  platform?: string;
  title?: string;
  contentUrl?: string;
  thumbnailUrl?: string;
  description?: string;
}

export interface BookmarkCheckResponse {
  isBookmarked: boolean;
}

export interface BookmarkCheckBatchResponse {
  [contentId: string]: boolean;
}

export class BookmarkService {
  @Get("/api/v1/bookmark")
  async getBookmarks(): Promise<BookmarkResponse> {
    return { id: "", contents: [] };
  }

  @Get("/api/v1/bookmark/check")
  async checkBookmark(
    @Query("contentId") contentId: string
  ): Promise<BookmarkCheckResponse> {
    return { isBookmarked: false };
  }

  @Get("/api/v1/bookmark/check-batch")
  async checkBookmarkBatch(
    @Query("contentIds") contentIds: string
  ): Promise<BookmarkCheckBatchResponse> {
    return {};
  }

  @Put("/api/v1/bookmark/{id}/content/add")
  async addContent(
    @Path("id") bookmarkId: string,
    @Body() body: AddBookmarkContentBody
  ): Promise<void> {
    return;
  }

  @Delete("/api/v1/bookmark/{id}/content/remove/{contentId}")
  async removeContent(
    @Path("id") bookmarkId: string,
    @Path("contentId") contentId: string
  ): Promise<void> {
    return;
  }
}