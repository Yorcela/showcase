export class PrismaClient {
  async $connect(): Promise<void> {}
  async $disconnect(): Promise<void> {}
  async $queryRaw<T = unknown>(..._args: unknown[]): Promise<T> {
    return [] as unknown as T;
  }
  async $executeRawUnsafe(..._args: unknown[]): Promise<unknown> {
    return 0;
  }
  async $transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return fn(this);
  }
  [key: string]: unknown;
}

export const Prisma = {} as Record<string, unknown>;
