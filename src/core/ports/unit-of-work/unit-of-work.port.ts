export type UowContext = unknown;

export interface UnitOfWorkPort {
  runInTransaction<T>(fn: (ctx: UowContext) => Promise<T>): Promise<T>;
}
export const UNIT_OF_WORK_PORT = Symbol("UNIT_OF_WORK_PORT");
