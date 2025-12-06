import { Injectable } from "@nestjs/common";

import { PrismaUowContext } from "@infrastructure/orm/prisma/prisma-uow.adapter";
import { PrismaService } from "@infrastructure/orm/prisma/prisma.service";

import { EmailVerificationRepoPort } from "../../../application/ports/email-verification.repo.port";
import { EmailVerificationEntity } from "../../../domain/entities/email-verification.entity";

const select = {
  id: true,
  userId: true,
  email: true,
  code: true,
  token: true,
  expiresAt: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class EmailVerificationPrismaRepository implements EmailVerificationRepoPort {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   *
   * @param input
   * @param ctx
   */
  async create(
    input: {
      userId: string;
      email: string;
      code: string;
      tokenHash: string;
      expiresAt: Date;
    },
    ctx?: PrismaUowContext,
  ): Promise<void> {
    await this.prismaService.getDb(ctx).emailVerification.create({
      data: {
        userId: input.userId,
        email: input.email.toLowerCase(),
        code: input.code,
        token: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  /**
   *
   * @param tokenHash
   * @param ctx
   * @returns
   */
  async findValidByTokenHash(tokenHash: string, ctx?: PrismaUowContext) {
    const now = new Date();
    const raw = await this.prismaService.getDb(ctx).emailVerification.findFirst({
      where: { token: tokenHash, verifiedAt: null, expiresAt: { gt: now } },
      select,
    });
    return raw ? EmailVerificationEntity.fromRaw(raw) : null;
  }

  /**
   *
   * @param id
   * @param ctx
   */
  async consume(token: string, ctx?: PrismaUowContext): Promise<void> {
    await this.prismaService.getDb(ctx).emailVerification.update({
      where: { token },
      data: { verifiedAt: new Date() },
    });
  }
}
