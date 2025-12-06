import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

import { APP_CONFIG, AppConfig } from "@shared/modules/config/app.config";

import { PrismaUowContext } from "./prisma-uow.adapter";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Inject(APP_CONFIG) private readonly appConfig: AppConfig) {
    super();
  }

  getDb(ctx?: PrismaUowContext): Prisma.TransactionClient | PrismaService {
    const c = ctx;
    return c?.tx ?? this;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("🗄️  Database connected");
    } catch (error) {
      this.logger.error("❌ Failed to connect to database", error);
      if (this.appConfig.isProduction()) throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log("🗄️  Database disconnected");
    } catch (error) {
      this.logger.error("Error disconnecting from database:", error as Error);
    }
  }

  async cleanDatabase() {
    if (this.appConfig.isTest()) {
      const tables = await this.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname='public'
      `;
      for (const { tablename } of tables) {
        if (tablename !== "_prisma_migrations") {
          await this.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`);
        }
      }
    }
  }
}
