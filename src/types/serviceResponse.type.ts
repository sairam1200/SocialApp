export type ServiceResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
