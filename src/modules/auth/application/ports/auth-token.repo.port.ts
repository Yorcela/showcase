import { UowContext } from "@ports/unit-of-work/unit-of-work.port";
import { Cuid2 } from "@apptypes/cuid2.type";
import { RefreshTokenEntity } from "../../domain/entities/refresh-token.entity";
import { SessionEntity } from "../../domain/entities/session.entity";

export type CreatSessionInput = {
  userId: Cuid2;
  expiresAt: number;
  ipAddress?: string;
  userAgent?: string;
};
export type CreatRefreshInput = {
  userId: Cuid2;
  expiresAt: number;
  sessionId: Cuid2;
  tokenHash: string;
};

export interface AuthTokenRepoPort {
  // SESSION
  createSession(input: CreatSessionInput, ctx?: UowContext): Promise<SessionEntity>;
  revokeSession(sessionId: Cuid2, ctx?: UowContext): Promise<void>;

  // REFRESH TOKEN
  createRefreshToken(input: CreatRefreshInput, ctx?: UowContext): Promise<RefreshTokenEntity>;
  findRefreshTokenByHash(tokenHash: string, ctx?: UowContext): Promise<RefreshTokenEntity | null>;
  revokeRefreshToken(token: RefreshTokenEntity, ctx?: UowContext): Promise<void>;
  revokeAllForSession(sessionId: Cuid2, ctx?: UowContext): Promise<void>;
  revokeAllForUser(userId: Cuid2, ctx?: UowContext): Promise<void>;
}

export const AUTH_TOKEN_REPO_PORT = Symbol("AUTH_TOKEN_REPO_PORT");
