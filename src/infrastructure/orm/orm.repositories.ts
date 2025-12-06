import { APP_CONFIG, AppConfig } from "@shared/modules/config/app.config";

import { OrmClient } from "./orm.module";
import { AllOrmRepoTokens, OrmRepoSymbol } from "./orm.repo-tokens.registry";
import { ORM_PROVIDER } from "./orm.tokens";
import { PrismaRepositoriesMap } from "./prisma/prisma.registry";
import { PrismaService } from "./prisma/prisma.service";

export function getProviders() {
  const inject = [APP_CONFIG, ORM_PROVIDER];
  return AllOrmRepoTokens.map((repoToken) => ({
    provide: repoToken,
    useFactory: (appConfig: AppConfig, client: OrmClient) =>
      getRepository(repoToken, appConfig, client),
    inject,
  }));
}

function getRepository(repoToken: OrmRepoSymbol, appConfig: AppConfig, client: OrmClient) {
  const orm = appConfig.getOrm();
  if (orm === "prisma") {
    const ctor = PrismaRepositoriesMap.get(repoToken);
    if (!ctor) {
      throw new Error(`Repository ${repoToken.toString()} not registered for ORM : ${orm}`);
    }
    return new ctor(client as PrismaService);
  }
  throw new Error(`Repository ${repoToken.toString()} not registered for ORM : ${orm}`);
}
