import { AUTH_EMAIL_VERIFICATION_REPO_PORT } from "@modules/auth/application/ports/email-verification.repo.port";
import { EmailVerificationPrismaRepository } from "@modules/auth/infrastructure/repository/prisma/email-verification.prisma.repository";
import { USER_REPO_PORT } from "@modules/user/application/ports/user.repo.port";
import { PrismaUserRepository } from "@modules/user/infrastructure/prisma/user.repository";

import { APP_CONFIG, AppConfig } from "@shared/modules/config/app.config";

import { AllOrmRepoTokens } from "./orm.repo-tokens.registry";
import { getProviders } from "./orm.repositories";
import { ORM_PROVIDER } from "./orm.tokens";
import { PrismaRepositoriesMap } from "./prisma/prisma.registry";
import { PrismaService } from "./prisma/prisma.service";

describe("ORM repositories provider mapping", () => {
  const prismaInstance = {} as PrismaService;

  beforeEach(() => {
    PrismaRepositoriesMap.set(USER_REPO_PORT, PrismaUserRepository);
    PrismaRepositoriesMap.set(AUTH_EMAIL_VERIFICATION_REPO_PORT, EmailVerificationPrismaRepository);
  });

  it("should expose providers for each repository port", () => {
    const providers = getProviders();

    expect(providers).toHaveLength(AllOrmRepoTokens.length);
    providers.forEach((provider) => {
      expect(provider.inject).toEqual([APP_CONFIG, ORM_PROVIDER]);
      const cfg = { getOrm: jest.fn().mockReturnValue("prisma") } as unknown as AppConfig;
      const repoInstance = provider.useFactory(cfg, prismaInstance as unknown);
      switch (provider.provide) {
        case USER_REPO_PORT:
          expect(repoInstance).toBeInstanceOf(PrismaUserRepository);
          break;
        case AUTH_EMAIL_VERIFICATION_REPO_PORT:
          expect(repoInstance).toBeInstanceOf(EmailVerificationPrismaRepository);
          break;
        default:
          expect(repoInstance).toBeDefined();
          break;
      }
    });
  });

  it("should throw when repository mapping is missing", () => {
    PrismaRepositoriesMap.delete(USER_REPO_PORT);
    const providers = getProviders();
    const cfg = { getOrm: jest.fn().mockReturnValue("prisma") } as unknown as AppConfig;

    expect(() => providers[0].useFactory(cfg, prismaInstance as unknown)).toThrow(
      /Repository Symbol\(USER_REPO_PORT\) not registered/,
    );
  });

  it("should throw when ORM is unsupported", () => {
    const providers = getProviders();
    const cfg = { getOrm: jest.fn().mockReturnValue("unsupported") } as unknown as AppConfig;

    expect(() => providers[0].useFactory(cfg, prismaInstance as unknown)).toThrow(
      /not registered for ORM : unsupported/,
    );
  });
});
