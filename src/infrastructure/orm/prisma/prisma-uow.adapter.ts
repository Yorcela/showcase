import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { UnitOfWorkPort } from "@ports/unit-of-work/unit-of-work.port";

import { PrismaService } from "./prisma.service";

export type PrismaUowContext = { tx: Prisma.TransactionClient };

@Injectable()
export class PrismaUnitOfWorkAdapter implements UnitOfWorkPort {
  constructor(private readonly prismaService: PrismaService) {}

  async runInTransaction<T>(fn: (ctx: { tx: PrismaUowContext }) => Promise<T>): Promise<T> {
    return this.prismaService.$transaction(async (tx) => {
      return fn({ tx } as any);
    });
  }
}
