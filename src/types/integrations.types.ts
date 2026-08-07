import { ServiceResponse } from "./serviceResponse.type";

export interface ConnectResponse {
    authorizeURL: string;
}

export type ConnectCallbackResponseType = ServiceResponse & {
    success: boolean;
    expiresIn?: string | number;
    message?: string;
}

export interface PublishPlatformCapabilities {
    supportedMediaTypes: string[];
    maxFileSizeBytes: number;
    maxDurationSec?: number;
    maxTitleLength?: number;
    maxDescriptionLength?: number;
    supportsScheduledPublish: boolean;
    supportsTags: boolean;
}

export type PublishCapabilities = Record<string, PublishPlatformCapabilities>;

export interface ImportRequestBody {
    [key: string]: unknown;
}

export type ImportJobStatus =
    | "not_found"
    | "queued"
    | "running"
    | "cancellation_requested"
    | "cancelled"
    | "completed"
    | "failed";

export interface ImportJobStatusResponse {
    platform: string;
    jobId: string | null;
    status: ImportJobStatus;
    progress: number | Record<string, unknown>;
    failedReason?: string;
}

export interface ImportCancellationResponse {
    message: string;
    jobId?: string | null;
    status?: "not_found" | "cancellation_requested" | "cancelled" | "completed" | "failed";
}
