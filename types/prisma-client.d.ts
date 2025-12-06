declare module "@prisma/client" {
  export const Prisma: Record<string, unknown>;

  export namespace Prisma {
    type TransactionClient = PrismaClient;
    type SessionSelect = any;
    type RefreshTokenSelect = any;
    type UserSelect = any;
  }

  export class PrismaClient {
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $queryRaw<T = unknown>(...args: unknown[]): Promise<T>;
    $executeRawUnsafe(...args: unknown[]): Promise<unknown>;
    $transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
    [key: string]: any;
  }
}
