import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaUowContext } from "@infrastructure/orm/prisma/prisma-uow.adapter";
import { PrismaService } from "@infrastructure/orm/prisma/prisma.service";
import { Cuid2 } from "@apptypes/cuid2.type";
import {
  RefreshTokenEntity,
  RefreshTokenRaw,
} from "../../../../auth/domain/entities/refresh-token.entity";
import { SessionEntity, SessionRaw } from "../../../../auth/domain/entities/session.entity";
import {
  AuthTokenRepoPort,
  CreatRefreshInput,
  CreatSessionInput,
} from "../../../application/ports/auth-token.repo.port";

const SessionSelect = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  expiresAt: true,
  ipAddress: true,
  userAgent: true,
  revokedAt: true,
} as const satisfies Prisma.SessionSelect;

const RefreshTokenSelect = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  expiresAt: true,
  revokedAt: true,
  sessionId: true,
  tokenHash: true,
  lastUsedAt: true,
} as const satisfies Prisma.RefreshTokenSelect;

@Injectable()
export class PrismaAuthTokenPrismaRepository implements AuthTokenRepoPort {
  constructor(private readonly prismaService: PrismaService) {}
  // SESSION
  /**
   *
   * @param input
   * @param ctx
   * @returns
   */
  async createSession(input: CreatSessionInput, ctx?: PrismaUowContext): Promise<SessionEntity> {
    // todo : mettre une erreur spécifique pour createSession
    const data = {
      userId: input.userId as string,
      expiresAt: new Date(input.expiresAt),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };
    return SessionEntity.fromRaw(
      (await this.prismaService
        .getDb(ctx)
        .session.create({ data, select: SessionSelect })) as SessionRaw,
    );
  }

  // REFRESH TOKEN
  /**
   *
   * @param input
   * @param ctx
   * @returns
   */
  async createRefreshToken(
    input: CreatRefreshInput,
    ctx?: PrismaUowContext,
  ): Promise<RefreshTokenEntity> {
    // todo : mettre une erreur spécifique pour createRefreshToken
    const data = {
      userId: input.userId as string,
      expiresAt: new Date(input.expiresAt),
      sessionId: input.sessionId,
      tokenHash: input.tokenHash,
    };
    return RefreshTokenEntity.fromRaw(
      (await this.prismaService
        .getDb(ctx)
        .refreshToken.create({ data, select: RefreshTokenSelect })) as RefreshTokenRaw,
    );
  }

  /**
   *
   * @param tokenHash
   * @param ctx
   * @returns
   */
  async findRefreshTokenByHash(
    tokenHash: string,
    ctx?: PrismaUowContext,
  ): Promise<RefreshTokenEntity | null> {
    const token = await this.prismaService
      .getDb(ctx)
      .refreshToken.findUnique({ where: { tokenHash } });
    return token ? RefreshTokenEntity.fromRaw(token as RefreshTokenRaw) : null;
  }

  /**
   *
   * @param id
   * @param ctx
   */
  async revokeRefreshToken(token: RefreshTokenEntity, ctx?: PrismaUowContext): Promise<void> {
    // todo : mettre une erreur spécifique pour revokeRefreshToken
    token.markAsRevoked();
    const { id, ...data } = token.toRaw();
    await this.prismaService.getDb(ctx).refreshToken.update({ where: { id }, data });
  }

  /**
   *
   * @param sessionId
   * @param ctx
   */
  async revokeSession(sessionId: Cuid2, ctx?: PrismaUowContext): Promise<void> {
    // todo : mettre une erreur spécifique pour revokeSession
    const where = { id: sessionId };
    await this.prismaService
      .getDb(ctx)
      .session.delete({ where })
      .catch(() => {});
  }

  /**
   *
   * @param sessionId
   * @param ctx
   */
  async revokeAllForSession(sessionId: Cuid2, ctx?: PrismaUowContext): Promise<void> {
    // todo : mettre une erreur spécifique pour revokeAllForSession
    await this.prismaService.getDb(ctx).refreshToken.updateMany({
      where: { sessionId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   *
   * @param userId
   * @param ctx
   */
  async revokeAllForUser(userId: Cuid2, ctx?: PrismaUowContext): Promise<void> {
    // todo : mettre une erreur spécifique pour revokeAllForUser
    await this.prismaService.getDb(ctx).refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }
}
