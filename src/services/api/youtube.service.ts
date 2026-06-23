import { Post, Get, Body, Path } from "restfit";
import {
  YoutubeUploadResponse,
  YoutubeStatsResponse,
  YoutubeSyncResponse,
  YoutubeVideoStatusResponse,
} from "@/types/social/youtube.type";

export class YoutubeService {
  @Post<YoutubeUploadResponse>("/integrations/youtube/upload")
  async uploadVideo(
    @Body() body: FormData
  ): Promise<YoutubeUploadResponse> {
    return {} as YoutubeUploadResponse;
  }

  @Get<YoutubeStatsResponse>("/integrations/youtube/get-stats")
  async getStats(): Promise<YoutubeStatsResponse> {
    return {} as YoutubeStatsResponse;
  }

  @Post<YoutubeSyncResponse>("/integrations/youtube/sync")
  async sync(): Promise<YoutubeSyncResponse> {
    return { success: false, message: "" };
  }

  @Get<YoutubeVideoStatusResponse>("/integrations/youtube/upload/status/{videoId}")
  async getUploadStatus(
    @Path("videoId") videoId: string
  ): Promise<YoutubeVideoStatusResponse> {
    return {} as YoutubeVideoStatusResponse;
  }

  @Post<{ jobId: string; status: string }>("/integrations/youtube/upload/retry/{videoId}")
  async retryUpload(
    @Path("videoId") videoId: string
  ): Promise<{ jobId: string; status: string }> {
    return { jobId: "", status: "" };
  }
}
