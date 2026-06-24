/* eslint-disable @typescript-eslint/no-unused-vars */
import { Post, Get, Delete, Body, Path, Query } from "restfit";
import {
  ConnectResponse,
  ConnectCallbackResponseType,
  ImportRequestBody,
} from "@/types/integrations.types";

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
    @Path("platform") platform: string,
    @Query("cursor") cursor?: string
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
  @Delete("/integrations/{platform}/disconnect")
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

  /** Upload a media file and return its URL */
  @Post<{ url: string }>("/integrations/upload")
  async uploadMedia(@Body() body: FormData): Promise<{ url: string }> {
    return { url: "" };
  }
}