export interface ConfigPort {
  get<T = string>(key: string, fallback?: T): T;
  isTest(): boolean;
}
export const CONFIG_PORT = Symbol("CONFIG_PORT");
