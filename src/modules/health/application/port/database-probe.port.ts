export interface DatabaseProbePort {
  ping(): Promise<number>;
}
export const DATABASE_PROBE_PORT = Symbol("DATABASE_PROBE_PORT");
