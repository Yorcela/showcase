import { PrismaService } from "@infrastructure/orm/prisma/prisma.service";

import { EmailVerificationPrismaRepository } from "./email-verification.prisma.repository";
import { verificationRepoContract } from "../../../application/ports/email-verification.repo.contract.port";
type EmailVerificationRow = {
  id: string;
  userId: string;
  email: string;
  code: string;
  tokenHash: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function createId() {
  return `test_${Math.random().toString(36).slice(2)}`;
}

function now() {
  return new Date();
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

class InMemoryPrismaService {
  private _verifs: EmailVerificationRow[] = [];

  public emailVerification = {
    create: async ({
      data,
    }: {
      data: Omit<EmailVerificationRow, "id" | "createdAt" | "updatedAt" | "verifiedAt"> &
        Partial<Pick<EmailVerificationRow, "verifiedAt">>;
    }) => {
      const row: EmailVerificationRow = {
        id: createId(),
        createdAt: now(),
        updatedAt: now(),
        verifiedAt: null,
        userId: data.userId,
        email: data.email,
        code: data.code,
        tokenHash: (data as any).token,
        expiresAt: new Date(data.expiresAt),
      };
      this._verifs.push(row);
      return clone(row);
    },

    findFirst: async ({
      where,
      select,
    }: {
      where: { token: string; verifiedAt: null; expiresAt: { gt: Date } };
      select: Record<string, boolean>;
    }) => {
      const row = this._verifs.find(
        (v) =>
          v.tokenHash === where.token && v.verifiedAt === null && v.expiresAt > where.expiresAt.gt,
      );
      if (!row) return null;

      // Applique grossièrement le select attendu par le repo
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(select)) {
        if (!(select as any)[key]) continue;
        if (key === "token") {
          result[key] = row.tokenHash;
          continue;
        }
        (result as any)[key] = (row as any)[key];
      }
      return result;
    },

    update: async ({ where, data }: { where: { token: string }; data: { verifiedAt: Date } }) => {
      const idx = this._verifs.findIndex((v) => v.tokenHash === where.token);
      if (idx < 0) throw new Error("Row not found");
      const current = this._verifs[idx];
      const next: EmailVerificationRow = {
        ...current,
        verifiedAt: data.verifiedAt,
        updatedAt: now(),
      };
      this._verifs[idx] = next;
      return clone(next);
    },

    deleteMany: async () => {
      const count = this._verifs.length;
      this._verifs = [];
      return { count };
    },
  };
}

// -----------------------------------------------------------------------------

describe("EmailVerificationPrismaRepository (contract)", () => {
  // Given a repo factory bound to our in-memory prisma stub
  const prismaDb = new InMemoryPrismaService();
  const prismaService = {
    getDb: jest.fn().mockImplementation(() => prismaDb),
  } as unknown as PrismaService;
  const makeRepo = () => new EmailVerificationPrismaRepository(prismaService);

  // Hooks required by the shared contract
  const hooks = {
    beforeEach: async () => {
      await prismaService.getDb().emailVerification.deleteMany();
    },
  };

  // Reuse your shared contract tests (they will now run purely in-memory)
  verificationRepoContract(makeRepo, hooks);

  // No DB to disconnect from, but keep afterAll for symmetry
  afterAll(async () => {
    // nothing to do
  });
});
