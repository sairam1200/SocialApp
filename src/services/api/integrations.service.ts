/* eslint-disable @typescript-eslint/no-unused-vars */
import { Get, Post, Path, Body, Query } from "restfit";
import {
  ConnectResponse,
  ConnectCallbackResponseType,
  ImportRequestBody,
} from "@/types/integrations.types";
import {
  YoutubeUploadRequest,
  YoutubeUploadResponse,
  YoutubeStatsResponse,
  YoutubeSyncResponse,
  YoutubeProfileResponse,
} from "@/types/social/youtube.type";

export class IntegrationsService {
  /** OAuth */
  @Get<ConnectResponse>("/integrations/{platform}/connect")
  async connect(
    @Path("platform") platform: string
  ): Promise<ConnectResponse> {
    return { authorizeURL: "" };
  }

  /** OAuth callback */
  @Get<ConnectCallbackResponseType<unknown>>(
    "/integrations/{platform}/connect-callback"
  )
  async connectCallback<T = unknown>(
    @Path("platform") platform: string,
    @Query("code") code: string,
    @Query("state") state: string
  ): Promise<ConnectCallbackResponseType<T>> {
    return {} as ConnectCallbackResponseType<T>;
  }

  /** Current account */
  @Get("/integrations/{platform}/me")
  async getMe<T = unknown>(
    @Path("platform") platform: string
  ): Promise<T> {
    return {} as T;
  }

  /** Connected profile */
  @Get("/integrations/{platform}/profile")
  async getProfile<T>(
    @Path("platform") platform: string
  ): Promise<T> {
    return {} as T;
  }

  /** Imported content */
  @Get("/integrations/{platform}/contents")
  async getContents<T= unknown>(
    @Path("platform") platform: string
  ): Promise<T > {
    return { } as T;
  }

  /** Import content */
  @Post("/integrations/{platform}/import")
  async importContent(
    @Path("platform") platform: string,
    @Body() body: ImportRequestBody
  ): Promise<{
    message: string;
    accessToken?: string;
    expiresIn?: number;
  }> {
    return {
      message: "",
    };
  }

  /** Cancel import */
  @Post("/integrations/{platform}/import/cancel")
  async cancelImport(
    @Path("platform") platform: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: false,
      message: "",
    };
  }

  /** Enable sync */
  @Post("/integrations/{platform}/sync/enable")
  async enableSync(
    @Path("platform") platform: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: false,
      message: "",
    };
  }

  /** Disable sync */
  @Post("/integrations/{platform}/sync/disable")
  async disableSync(
    @Path("platform") platform: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: false,
      message: "",
    };
  }

  //delete
  @Post("/integrations/{platform}/disconnect")
  async disconnect(
    @Path("platform") platform: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return {
      success: false,
      message: "",
    };
  }

  /** YouTube: Upload video */
  @Post<YoutubeUploadResponse>("/youtube/upload")
  async uploadYoutubeVideo(
    @Body() body: YoutubeUploadRequest
  ): Promise<YoutubeUploadResponse> {
    return {} as YoutubeUploadResponse;
  }

  /** YouTube: Get channel stats */
  @Get<YoutubeStatsResponse>("/youtube/get-stats")
  async getYoutubeStats(): Promise<YoutubeStatsResponse> {
    return {} as YoutubeStatsResponse;
  }

  /** YouTube: Sync content */
  @Post<YoutubeSyncResponse>("/youtube/sync")
  async syncYoutube(): Promise<YoutubeSyncResponse> {
    return { success: false, message: "" };
  }

  /** YouTube: Get profile (extended) */
  @Get<YoutubeProfileResponse>("/youtube/get-profile")
  async getYoutubeProfile(): Promise<YoutubeProfileResponse> {
    return {} as YoutubeProfileResponse;
  }

  /** Upload a media file and return its URL */
  @Post<{ url: string }>("/media/upload")
  async uploadMedia(@Body() body: FormData): Promise<{ url: string }> {
    return { url: "" };
  }
}