import { PrismaService } from "@infrastructure/orm/prisma/prisma.service";
import { Cuid2 } from "@apptypes/cuid2.type";
import { HashedToken } from "@apptypes/hashed-token.type";
import { PrismaAuthTokenPrismaRepository } from "./auth-token.prisma.repository";
import { RefreshTokenEntity } from "../../../domain/entities/refresh-token.entity";
import { SessionEntity } from "../../../domain/entities/session.entity";

type SessionRow = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  revokedAt: Date | null;
};

type RefreshTokenRow = {
  id: string;
  userId: string;
  sessionId: string;
  tokenHash: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
};

function createSessionRow(data: {
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  revokedAt?: Date | null;
}): SessionRow {
  const now = new Date();
  return {
    id: `ses_${Math.random().toString(36).slice(2, 8)}`,
    userId: data.userId,
    createdAt: now,
    updatedAt: now,
    expiresAt: data.expiresAt,
    ipAddress: data.ipAddress ?? null,
    userAgent: data.userAgent ?? null,
    revokedAt: data.revokedAt ?? null,
  };
}

function createRefreshRow(data: {
  userId: string;
  sessionId: string;
  tokenHash: string;
  expiresAt: Date;
}): RefreshTokenRow {
  const now = new Date();
  return {
    id: `rft_${Math.random().toString(36).slice(2, 8)}`,
    userId: data.userId,
    sessionId: data.sessionId,
    tokenHash: data.tokenHash,
    createdAt: now,
    updatedAt: now,
    expiresAt: data.expiresAt,
    revokedAt: null,
    lastUsedAt: null,
  };
}

class InMemoryPrisma {
  sessions: SessionRow[] = [];
  refreshTokens: RefreshTokenRow[] = [];

  session = {
    create: async ({ data }: { data: any }) => {
      const row = createSessionRow(data);
      this.sessions.push(row);
      return row;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      this.sessions = this.sessions.filter((session) => session.id !== where.id);
    },
  };

  refreshToken = {
    create: async ({ data }: { data: any }) => {
      const row = createRefreshRow(data);
      this.refreshTokens.push(row);
      return row;
    },
    findUnique: async ({ where: { tokenHash } }: { where: { tokenHash: string } }) => {
      return this.refreshTokens.find((token) => token.tokenHash === tokenHash) ?? null;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<RefreshTokenRow> }) => {
      const idx = this.refreshTokens.findIndex((token) => token.id === where.id);
      if (idx === -1) throw new Error("Refresh token not found");
      this.refreshTokens[idx] = { ...this.refreshTokens[idx], ...data };
      return this.refreshTokens[idx];
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: Partial<RefreshTokenRow>;
      data: Partial<RefreshTokenRow>;
    }) => {
      this.refreshTokens = this.refreshTokens.map((token) => {
        const matchSession = where.sessionId ? token.sessionId === where.sessionId : true;
        const matchUser = where.userId ? token.userId === where.userId : true;
        if (matchSession && matchUser) {
          return { ...token, ...data };
        }
        return token;
      });
      return { count: this.refreshTokens.length };
    },
  };
}

describe("PrismaAuthTokenPrismaRepository", () => {
  const memory = new InMemoryPrisma();
  const prismaService = {
    getDb: jest.fn().mockReturnValue(memory),
  } as unknown as PrismaService;

  const repository = new PrismaAuthTokenPrismaRepository(prismaService);

  beforeEach(() => {
    memory.sessions = [];
    memory.refreshTokens = [];
    jest.clearAllMocks();
  });

  it("should create session", async () => {
    const expiresAt = new Date("2024-01-02T00:00:00.000Z");

    const session = await repository.createSession({
      userId: "usr_1" as Cuid2,
      expiresAt: expiresAt.getTime(),
      ipAddress: "1.1.1.1",
      userAgent: "jest",
    });

    expect(session).toBeInstanceOf(SessionEntity);
    expect(session.userId).toBe("usr_1");
    expect(session.ipAddress).toBe("1.1.1.1");
  });

  it("should create refresh token", async () => {
    const token = await repository.createRefreshToken({
      userId: "usr_1" as Cuid2,
      sessionId: "ses_1" as Cuid2,
      tokenHash: "hash-1" as HashedToken,
      expiresAt: new Date().getTime(),
    });

    expect(token).toBeInstanceOf(RefreshTokenEntity);
    expect(token.tokenHash).toBe("hash-1");
  });

  it("should find refresh token by hash", async () => {
    const stored = await repository.createRefreshToken({
      userId: "usr_find" as Cuid2,
      sessionId: "ses_find" as Cuid2,
      tokenHash: "hash-find" as HashedToken,
      expiresAt: new Date().getTime() + 1000,
    });

    const found = await repository.findRefreshTokenByHash("hash-find");

    expect(found?.id).toBe(stored.id);
    expect(found?.sessionId).toBe(stored.sessionId);
  });

  it("should return null when refresh token is missing", async () => {
    const result = await repository.findRefreshTokenByHash("missing-hash");
    expect(result).toBeNull();
  });

  it("should revoke refresh token", async () => {
    const token = await repository.createRefreshToken({
      userId: "usr_revoke" as Cuid2,
      sessionId: "ses_revoke" as Cuid2,
      tokenHash: "hash-revoke" as HashedToken,
      expiresAt: new Date().getTime() + 1000,
    });

    jest.spyOn(token, "markAsRevoked");

    await repository.revokeRefreshToken(token);

    const stored = memory.refreshTokens.find((row) => row.id === token.id);
    expect(stored?.revokedAt).not.toBeNull();
    expect(token.markAsRevoked).toHaveBeenCalledTimes(1);
  });

  it("should ignore errors when revoking missing session", async () => {
    const originalDelete = memory.session.delete;
    memory.session.delete = jest.fn().mockRejectedValue(new Error("Not found"));

    await expect(repository.revokeSession("missing" as Cuid2)).resolves.toBeUndefined();
    expect(memory.session.delete).toHaveBeenCalledWith({ where: { id: "missing" } });

    memory.session.delete = originalDelete;
  });

  it("should revoke all tokens for session", async () => {
    await repository.createRefreshToken({
      userId: "usr_batch" as Cuid2,
      sessionId: "ses_batch" as Cuid2,
      tokenHash: "hash-1" as HashedToken,
      expiresAt: new Date().getTime() + 1000,
    });
    await repository.createRefreshToken({
      userId: "usr_batch" as Cuid2,
      sessionId: "ses_batch" as Cuid2,
      tokenHash: "hash-2" as HashedToken,
      expiresAt: new Date().getTime() + 1000,
    });

    await repository.revokeAllForSession("ses_batch" as Cuid2);

    const revoked = memory.refreshTokens.filter((row) => row.sessionId === "ses_batch");
    expect(revoked.every((row) => row.revokedAt)).toBe(true);
  });

  it("should revoke all tokens for user", async () => {
    await repository.createRefreshToken({
      userId: "usr_all" as Cuid2,
      sessionId: "ses_one" as Cuid2,
      tokenHash: "hash-u1" as HashedToken,
      expiresAt: new Date().getTime() + 1000,
    });
    await repository.createRefreshToken({
      userId: "usr_all" as Cuid2,
      sessionId: "ses_two" as Cuid2,
      tokenHash: "hash-u2" as HashedToken,
      expiresAt: new Date().getTime() + 1000,
    });

    await repository.revokeAllForUser("usr_all" as Cuid2);

    const revoked = memory.refreshTokens.filter((row) => row.userId === "usr_all");
    expect(revoked.every((row) => row.revokedAt)).toBe(true);
  });
});
