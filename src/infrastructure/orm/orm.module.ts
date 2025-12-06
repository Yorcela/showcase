import { Global, Module } from "@nestjs/common";

import { CoreConfigModule } from "@shared/modules/config/config.module";
import { AllOrmRepoTokens } from "./orm.repo-tokens.registry";
import { getProviders } from "./orm.repositories";
import { PrismaModule } from "./prisma/prisma.module";

@Global()
@Module({
  imports: [CoreConfigModule, PrismaModule],
  providers: getProviders(),
  exports: [CoreConfigModule, ...AllOrmRepoTokens],
})
export class OrmModule {}

export { ORM_PROVIDER } from "./orm.tokens";

export type OrmClient = unknown;
