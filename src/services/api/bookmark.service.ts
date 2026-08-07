import { Get, Put, Delete, Query, Path, Body } from "restfit";

export interface BookmarkResponse {
  id: string;
  contents: {
    id: string;
    contentId: string;
    type: string;
    platform: string;
    contentUrl: string;
    title: string;
    description: string | null;
    thumbnailUrl: string;
    metadata: Record<string, unknown> | null;
    addedBy: {
      id: string;
      displayName: string;
      userName: string;
    } | null;
    createdOn: string;
  }[];
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
  bookmarked: boolean;
}

export interface BookmarkCheckBatchResponse {
  bookmarkedIds: string[];
}

export class BookmarkService {
  @Get("/bookmark")
  async getBookmarks(): Promise<BookmarkResponse> {
    return { id: "", contents: [] };
  }

  @Get("/bookmark/check")
  async checkBookmark(
    @Query("userContentId") userContentId: string
  ): Promise<BookmarkCheckResponse> {
    return { bookmarked: false };
  }

  @Get("/bookmark/check-batch")
  async checkBookmarkBatch(
    @Query("userContentIds") userContentIds: string
  ): Promise<BookmarkCheckBatchResponse> {
    return { bookmarkedIds: [] };
  }

  @Put("/bookmark/{id}/content/add")
  async addContent(
    @Path("id") bookmarkId: string,
    @Body() body: AddBookmarkContentBody
  ): Promise<void> {
    return;
  }

  @Delete("/bookmark/{id}/content/remove/{contentId}")
  async removeContent(
    @Path("id") bookmarkId: string,
    @Path("contentId") contentId: string
  ): Promise<void> {
    return;
  }
}
