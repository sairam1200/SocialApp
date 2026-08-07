import { ResponseInterceptorConfig } from "restfit";
import { tokenRefreshInterceptor } from "./tokenRefresh.interceptor";
import { unauthorizedInterceptor } from "./unauthorized.interceptor";

export const interceptors: ResponseInterceptorConfig[] = [
  tokenRefreshInterceptor,
  unauthorizedInterceptor,
];