import { UNIT_OF_WORK_PORT } from "@ports/unit-of-work/unit-of-work.port";
import { AUTH_TOKEN_REPO_PORT } from "@modules/auth/application/ports/auth-token.repo.port";
import { AUTH_EMAIL_VERIFICATION_REPO_PORT } from "@modules/auth/application/ports/email-verification.repo.port";
import { DATABASE_PROBE_PORT } from "@modules/health/application/port/database-probe.port";
import { USER_REPO_PORT } from "@modules/user/application/ports/user.repo.port";

export const OrmRepo = {
  USER: USER_REPO_PORT,
  AUTH_EMAIL_VERIFICATION: AUTH_EMAIL_VERIFICATION_REPO_PORT,
  DATABASE_PROBE: DATABASE_PROBE_PORT,
  UNIT_OF_WORK_PORT: UNIT_OF_WORK_PORT,
  AUTH_TOKEN_REPO_PORT: AUTH_TOKEN_REPO_PORT,
} as const;

export type OrmRepoType = typeof OrmRepo;
export type OrmRepoKey = keyof OrmRepoType;
export type OrmRepoSymbol = OrmRepoType[OrmRepoKey];

export const AllOrmRepoTokens: OrmRepoSymbol[] = Object.values(OrmRepo);
