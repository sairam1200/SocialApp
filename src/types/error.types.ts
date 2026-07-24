import { AxiosError } from "axios";

export type ApiError = AxiosError<ApiErrorData | string>;

export interface ApiErrorData {
  type?: string;
  title?: string;
  detail?: string;
  message?: string;
  status?: number;
}
