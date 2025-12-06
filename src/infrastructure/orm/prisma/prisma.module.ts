import { Module } from "@nestjs/common";

import { ORM_PROVIDER } from "../orm.tokens";
import { PrismaService } from "./prisma.service";

const provideExport = [PrismaService, { provide: ORM_PROVIDER, useClass: PrismaService }];

@Module({
  providers: provideExport,
  exports: provideExport,
})
export class PrismaModule {}
