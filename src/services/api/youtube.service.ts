import { Post, Get, Body } from "restfit";
import {
  YoutubeUploadRequest,
  YoutubeUploadResponse,
  YoutubeStatsResponse,
  YoutubeSyncResponse,
} from "@/types/social/youtube.type";

export class YoutubeService {
  @Post<YoutubeUploadResponse>("/integrations/youtube/upload")
  async uploadVideo(
    @Body() body: YoutubeUploadRequest
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
}
