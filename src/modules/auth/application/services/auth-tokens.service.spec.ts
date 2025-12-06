import { JwtService } from "@nestjs/jwt";

import { AppConfig } from "@shared/modules/config/app.config";

import { Cuid2 } from "@apptypes/cuid2.type";
import { HashedToken } from "@apptypes/hashed-token.type";
import { SecuredToken } from "@apptypes/secured-token.type";

import { AuthTokenService } from "./auth-tokens.service";
import { AccessTokenEntity } from "../../domain/entities/access-token.entity";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { RefreshTokenEntity } from "../../domain/entities/refresh-token.entity";
import { SessionEntity } from "../../domain/entities/session.entity";
import { OtpGeneratorService } from "../../domain/services/otp-generator.service";
import { AuthTokenRepoPort } from "../ports/auth-token.repo.port";

describe("AuthTokenService", () => {
  const baseUserId = "usr_123" as Cuid2;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createService = () => {
    const jwt = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const otp = {
      generateToken: jest.fn(),
      getHashedToken: jest.fn(),
    } as unknown as jest.Mocked<OtpGeneratorService>;

    const appConfig = {
      getJwtRefreshExpiresInTimestamp: jest.fn(),
      getJwtRefreshExpiresInRememberInTimestamp: jest.fn(),
    } as unknown as jest.Mocked<AppConfig>;

    const authRepo = {
      createSession: jest.fn(),
      createRefreshToken: jest.fn(),
      revokeAllForSession: jest.fn(),
      revokeSession: jest.fn(),
      revokeAllForUser: jest.fn(),
      findRefreshTokenByHash: jest.fn(),
      revokeRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<AuthTokenRepoPort>;

    const service = new AuthTokenService(jwt, otp, appConfig, authRepo);

    return { service, jwt, otp, appConfig, authRepo };
  };

  it("should create tokens with standard expiration", async () => {
    const { service, jwt, otp, appConfig, authRepo } = createService();
    const ctx = { tx: Symbol("tx") } as unknown;

    const refreshExpiresAt = 222_000;
    appConfig.getJwtRefreshExpiresInTimestamp.mockReturnValue(refreshExpiresAt);

    const now = 111_000;
    jest.spyOn(Date, "now").mockReturnValue(now);

    const session = new SessionEntity(
      "ses_123" as Cuid2,
      baseUserId,
      new Date(now),
      new Date(now),
      new Date(refreshExpiresAt),
    );
    authRepo.createSession.mockResolvedValue(session);

    const refreshToken = "new-refresh-token" as SecuredToken;
    const refreshHash = "hash-new-token" as HashedToken;
    otp.generateToken.mockReturnValue(refreshToken);
    otp.getHashedToken.mockReturnValue(refreshHash);

    const accessToken = "signed-access-token";
    jwt.signAsync.mockResolvedValue(accessToken);

    const result = await service.createUserToken({ userId: baseUserId }, ctx);

    expect(appConfig.getJwtRefreshExpiresInTimestamp).toHaveBeenCalledTimes(1);
    expect(appConfig.getJwtRefreshExpiresInRememberInTimestamp).not.toHaveBeenCalled();

    expect(authRepo.createSession).toHaveBeenCalledWith(
      { userId: baseUserId, expiresAt: refreshExpiresAt },
      ctx,
    );
    expect(otp.generateToken).toHaveBeenCalledTimes(1);
    expect(otp.getHashedToken).toHaveBeenCalledWith(refreshToken);

    expect(authRepo.createRefreshToken).toHaveBeenCalledWith(
      {
        userId: baseUserId,
        sessionId: session.id,
        tokenHash: refreshHash,
        expiresAt: refreshExpiresAt,
      },
      ctx,
    );

    expect(jwt.signAsync).toHaveBeenCalledWith(
      AccessTokenEntity.toRaw(new AccessTokenEntity(baseUserId, session.id, now)),
    );

    expect(result).toBeInstanceOf(AuthEntity);
    expect(result.refreshToken).toBe(refreshToken);
    expect(result.accessToken).toBe(accessToken);
    expect(result.refreshTokenExpiresAt).toBe(refreshExpiresAt);
    expect(result.sessionId).toBe(session.id);
  });

  it("should create tokens with remember expiration", async () => {
    const { service, jwt, otp, appConfig, authRepo } = createService();

    const rememberExpiresAt = 500_000;
    appConfig.getJwtRefreshExpiresInRememberInTimestamp.mockReturnValue(rememberExpiresAt);

    const now = 400_000;
    jest.spyOn(Date, "now").mockReturnValue(now);

    const session = new SessionEntity(
      "ses_remember" as Cuid2,
      baseUserId,
      new Date(now),
      new Date(now),
      new Date(rememberExpiresAt),
    );
    authRepo.createSession.mockResolvedValue(session);

    const refreshToken = "remember-refresh" as SecuredToken;
    const refreshHash = "remember-hash" as HashedToken;
    const accessToken = "remember-access-token";
    otp.generateToken.mockReturnValue(refreshToken);
    otp.getHashedToken.mockReturnValue(refreshHash);
    jwt.signAsync.mockResolvedValue(accessToken);

    const result = await service.createUserToken({ userId: baseUserId, remember: true });

    expect(appConfig.getJwtRefreshExpiresInRememberInTimestamp).toHaveBeenCalledTimes(1);
    expect(appConfig.getJwtRefreshExpiresInTimestamp).not.toHaveBeenCalled();
    expect(authRepo.createSession).toHaveBeenCalledWith(
      { userId: baseUserId, expiresAt: rememberExpiresAt },
      undefined,
    );
    expect(authRepo.createRefreshToken).toHaveBeenCalledWith(
      {
        userId: baseUserId,
        sessionId: session.id,
        tokenHash: refreshHash,
        expiresAt: rememberExpiresAt,
      },
      undefined,
    );
    expect(jwt.signAsync).toHaveBeenCalledWith(
      AccessTokenEntity.toRaw(new AccessTokenEntity(baseUserId, session.id, now)),
    );
    expect(result.refreshToken).toBe(refreshToken);
    expect(result.accessToken).toBe(accessToken);
  });

  it("should revoke session and associated tokens", async () => {
    const { service, authRepo } = createService();
    const ctx = { tx: Symbol("tx") } as unknown;

    await service.revokeSession("ses-revoke" as Cuid2, ctx);

    expect(authRepo.revokeAllForSession).toHaveBeenCalledWith("ses-revoke", ctx);
    expect(authRepo.revokeSession).toHaveBeenCalledWith("ses-revoke", ctx);
  });

  it("should revoke all sessions for a user", async () => {
    const { service, authRepo } = createService();
    const ctx = { tx: Symbol("tx") } as unknown;

    await service.revokeAllUserSessions("usr-revoke" as Cuid2, ctx);

    expect(authRepo.revokeAllForUser).toHaveBeenCalledWith("usr-revoke", ctx);
  });

  it("should refresh tokens and rotate refresh token", async () => {
    const { service, authRepo, otp, jwt } = createService();
    const storedToken = RefreshTokenEntity.fromRaw({
      id: "rft_1",
      userId: baseUserId,
      sessionId: "ses_1",
      tokenHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 100_000),
      revokedAt: null,
      lastUsedAt: null,
    });

    const existingHash = "hash" as HashedToken;
    const newHash = "hash-new" as HashedToken;
    otp.getHashedToken.mockReturnValueOnce(existingHash).mockReturnValue(newHash);
    authRepo.findRefreshTokenByHash.mockResolvedValue(storedToken);
    otp.generateToken.mockReturnValue("new-refresh" as SecuredToken);
    jwt.signAsync.mockResolvedValue("new-access");

    const result = await service.refreshTokens("refresh" as SecuredToken);

    expect(authRepo.findRefreshTokenByHash).toHaveBeenCalledWith("hash", undefined);
    expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(storedToken, undefined);
    expect(authRepo.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ tokenHash: "hash-new" }),
      undefined,
    );
    expect(jwt.signAsync).toHaveBeenCalled();
    expect(result?.authEntity.accessToken).toBe("new-access");
    expect(result?.rotated).toBe(true);
  });

  it("should return null when refresh token is invalid", async () => {
    const { service, authRepo, otp } = createService();
    const hashed = "hash" as HashedToken;
    otp.getHashedToken.mockReturnValue(hashed);
    authRepo.findRefreshTokenByHash.mockResolvedValue(null);

    const result = await service.refreshTokens("refresh" as SecuredToken);

    expect(result).toBeNull();
  });

  it("should logout gracefully when token missing", async () => {
    const { service, otp } = createService();
    otp.getHashedToken.mockReturnValue("hash" as HashedToken);

    await service.logout(null);
  });

  it("should revoke session on logout", async () => {
    const { service, authRepo, otp } = createService();
    const storedToken = RefreshTokenEntity.fromRaw({
      id: "rft_1",
      userId: baseUserId,
      sessionId: "ses",
      tokenHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 100_000),
      revokedAt: null,
      lastUsedAt: null,
    });
    otp.getHashedToken.mockReturnValue("hash" as HashedToken);
    authRepo.findRefreshTokenByHash.mockResolvedValue(storedToken);

    await service.logout("refresh" as SecuredToken);

    expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(storedToken, undefined);
    expect(authRepo.revokeSession).toHaveBeenCalledWith("ses", undefined);
  });
});
