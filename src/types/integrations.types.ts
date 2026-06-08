import { ServiceResponse } from "./serviceResponse.type";

export interface ConnectResponse {
    authorizeURL: string;
}

export type ConnectCallbackResponseType<T = unknown> = ServiceResponse & {
    accessToken: string;
    expiresIn: string;
    profile: T;
}

export interface ImportRequestBody {
    // example { facebookAccessToken: string }
    [key: string]: unknown;
}
