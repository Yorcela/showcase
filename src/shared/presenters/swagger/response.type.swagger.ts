export interface AppResponseSwagger<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; context?: any };
}
