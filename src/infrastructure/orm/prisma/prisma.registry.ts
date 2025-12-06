import { PrismaAuthTokenPrismaRepository } from "@modules/auth/infrastructure/repository/prisma/auth-token.prisma.repository";
import { EmailVerificationPrismaRepository } from "@modules/auth/infrastructure/repository/prisma/email-verification.prisma.repository";
import { PrismaDatabaseProbe } from "@modules/health/infrastructure/prisma/database-probe.adapter";
import { PrismaUserRepository } from "@modules/user/infrastructure/prisma/user.repository";

import { PrismaService } from "./prisma.service";
import { OrmRepo, OrmRepoSymbol } from "../orm.repo-tokens.registry";
import { PrismaUnitOfWorkAdapter } from "./prisma-uow.adapter";

type Ctor<T = unknown> = new (client: PrismaService) => T;

export const PrismaRepositoriesMap = new Map<OrmRepoSymbol, Ctor>([
  [OrmRepo.DATABASE_PROBE, PrismaDatabaseProbe],
  [OrmRepo.UNIT_OF_WORK_PORT, PrismaUnitOfWorkAdapter],
  [OrmRepo.USER, PrismaUserRepository],
  [OrmRepo.AUTH_EMAIL_VERIFICATION, EmailVerificationPrismaRepository],
  [OrmRepo.AUTH_TOKEN_REPO_PORT, PrismaAuthTokenPrismaRepository],
]);
