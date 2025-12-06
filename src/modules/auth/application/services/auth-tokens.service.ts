import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UowContext } from "@ports/unit-of-work/unit-of-work.port";
import { AbstractService } from "@shared/core/abstract/service.abstract";
import { AppConfig } from "@shared/modules/config/app.config";
import { Cuid2 } from "@apptypes/cuid2.type";
import { HashedToken } from "@apptypes/hashed-token.type";
import { JwtToken } from "@apptypes/jwt.type";

import { SecuredToken } from "@apptypes/secured-token.type";
import { AccessTokenEntity } from "../../../auth/domain/entities/access-token.entity";
import { SessionEntity } from "../../../auth/domain/entities/session.entity";
import { OtpGeneratorService } from "../../../auth/domain/services/otp-generator.service";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { AuthRefreshTokenInvalidOrExpiredError } from "../../domain/errors/login.error";
import { AUTH_TOKEN_REPO_PORT, AuthTokenRepoPort } from "../ports/auth-token.repo.port";

export type CreateUserTokenType = { userId: Cuid2; remember?: boolean };

@Injectable()
export class AuthTokenService extends AbstractService {
  constructor(
    private readonly jwt: JwtService,
    private readonly otpGenService: OtpGeneratorService,
    private readonly appConfig: AppConfig,
    @Inject(AUTH_TOKEN_REPO_PORT) private readonly authRepo: AuthTokenRepoPort,
  ) {
    super();
  }

  /**
   *
   * @param userId
   * @param sessionId
   * @param email
   * @param role
   * @param ctx
   * @returns
   */
  async createUserToken(data: CreateUserTokenType, ctx?: UowContext): Promise<AuthEntity> {
    const { userId, remember } = data;
    const refreshTokenExpiresAt = remember
      ? this.appConfig.getJwtRefreshExpiresInRememberInTimestamp()
      : this.appConfig.getJwtRefreshExpiresInTimestamp();

    // Session
    const session: SessionEntity = await this.authRepo.createSession(
      { userId, expiresAt: refreshTokenExpiresAt },
      ctx,
    );
    const sessionId = session.id;

    // RefreshToken
    const refreshToken: SecuredToken = this.otpGenService.generateToken();
    const tokenHash: HashedToken = this.otpGenService.getHashedToken(refreshToken);
    await this.authRepo.createRefreshToken(
      { userId, sessionId, tokenHash, expiresAt: refreshTokenExpiresAt },
      ctx,
    );

    // AccessToken
    const accessTokenEntity: AccessTokenEntity = new AccessTokenEntity(
      userId,
      sessionId,
      Date.now(),
    );
    const accessToken: JwtToken = await this.signAccessToken(accessTokenEntity);

    return AuthEntity.fromRaw({
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      sessionId,
    });
  }

  async refreshTokens(
    refreshToken: SecuredToken,
    ctx?: UowContext,
  ): Promise<{ authEntity: AuthEntity; rotated: boolean } | null> {
    const tokenHash = this.otpGenService.getHashedToken(refreshToken);
    const stored = await this.authRepo.findRefreshTokenByHash(tokenHash, ctx);

    if (!stored) return null; // @todo : throw une erreur RefreshTokenUnknown
    if (stored.isExpired() || stored.isRevoked()) {
      try {
        await this.authRepo.revokeRefreshToken(stored, ctx);
      } catch (error) {
        this.logger?.debug?.("refresh token revoke failed", error as Error);
      }
      try {
        await this.authRepo.revokeSession(stored.sessionId, ctx);
      } catch (error) {
        this.logger?.debug?.("session revoke failed", error as Error);
      }
      return null; // @todo : throw une erreur RefreshTokenExpired
    }

    const expiresAt = stored.expiresAt.getTime();
    await this.authRepo.revokeRefreshToken(stored, ctx);

    const nextRefreshToken = this.otpGenService.generateToken();
    const nextHash = this.otpGenService.getHashedToken(nextRefreshToken);
    await this.authRepo.createRefreshToken(
      {
        userId: stored.userId,
        sessionId: stored.sessionId,
        tokenHash: nextHash,
        expiresAt,
      },
      ctx,
    );

    const accessTokenEntity = new AccessTokenEntity(stored.userId, stored.sessionId, Date.now());
    const accessToken = await this.signAccessToken(accessTokenEntity);
    const authEntity = AuthEntity.fromRaw({
      accessToken,
      refreshToken: nextRefreshToken,
      refreshTokenExpiresAt: expiresAt,
      sessionId: stored.sessionId,
    });

    return { authEntity, rotated: true };
  }

  async logout(refreshToken: SecuredToken | null, ctx?: UowContext): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = this.otpGenService.getHashedToken(refreshToken);
    const stored = await this.authRepo.findRefreshTokenByHash(tokenHash, ctx);
    if (!stored) throw new AuthRefreshTokenInvalidOrExpiredError();
    try {
      await this.authRepo.revokeRefreshToken(stored, ctx);
    } catch (error) {
      this.logger?.debug?.("refresh token revoke failed", error as Error);
    }
    try {
      await this.authRepo.revokeSession(stored.sessionId, ctx);
    } catch (error) {
      this.logger?.debug?.("session revoke failed", error as Error);
    }
  }

  /**
   *
   * @param sessionId
   * @param ctx
   */
  async revokeSession(sessionId: Cuid2, ctx?: UowContext): Promise<void> {
    await this.authRepo.revokeAllForSession(sessionId, ctx);
    await this.authRepo.revokeSession(sessionId, ctx);
  }

  /**
   *
   * @param userId
   * @param ctx
   */
  async revokeAllUserSessions(userId: Cuid2, ctx?: UowContext): Promise<void> {
    await this.authRepo.revokeAllForUser(userId, ctx);
  }

  /**
   *
   * @param accessTokenEntity
   * @returns
   */
  private async signAccessToken(accessTokenEntity: AccessTokenEntity): Promise<JwtToken> {
    return (await this.jwt.signAsync(accessTokenEntity.toRaw())) as JwtToken;
  }
}
