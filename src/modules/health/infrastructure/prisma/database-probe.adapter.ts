import { Injectable } from "@nestjs/common";

import { PrismaService } from "@infrastructure/orm/prisma/prisma.service";

import { DatabaseProbePort } from "../../application/port/database-probe.port";

@Injectable()
export class PrismaDatabaseProbe implements DatabaseProbePort {
  constructor(private readonly prisma: PrismaService) {}

  async ping(): Promise<number> {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`; // lève si KO
    return Date.now() - start;
  }
}
