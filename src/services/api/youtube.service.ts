import { Post, Get, Body, Path, Query } from "restfit";
import {
  YoutubeUploadResponse,
  YoutubeStatsResponse,
  YoutubeSyncResponse,
  YoutubeVideoStatusResponse,
} from "@/types/social/youtube.type";
import {
  YoutubeChannelAnalytics,
  YoutubeVideoAnalytics,
  YoutubeAnalyticsTrendsResponse,
  YoutubeTopVideosResponse,
} from "@/types/analytics/youtube";

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

  @Post<{ message: string }>("/integrations/youtube/analytics/sync")
  async syncAnalytics(): Promise<{ message: string }> {
    return { message: "" };
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

  @Get<YoutubeChannelAnalytics>("/integrations/youtube/analytics/channel")
  async getChannelAnalytics(): Promise<YoutubeChannelAnalytics> {
    return {} as YoutubeChannelAnalytics;
  }

  @Get<YoutubeTopVideosResponse>("/integrations/youtube/analytics/top-videos")
  async getTopVideos(@Query("limit") limit?: string): Promise<YoutubeTopVideosResponse> {
    return [] as YoutubeTopVideosResponse;
  }

  @Get<YoutubeAnalyticsTrendsResponse>("/integrations/youtube/analytics/trends")
  async getTrends(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("videoId") videoId?: string
  ): Promise<YoutubeAnalyticsTrendsResponse> {
    return [] as YoutubeAnalyticsTrendsResponse;
  }
}
