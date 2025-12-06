export interface AppHttpResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; context?: any };
}
