import { UnitOfWorkPort, UowContext } from "@ports/unit-of-work/unit-of-work.port";
import { UserService } from "@modules/user/application/services/user.service";
import { Cuid2 } from "@apptypes/cuid2.type";
import { AuthUseCase } from "./auth.usecase";
import {
  AuthLoginInvalidCredentialError,
  AuthRefreshTokenInvalidOrExpiredError,
} from "../../domain/errors/login.error";
import { AuthTokenService } from "../services/auth-tokens.service";

describe("AuthUseCase", () => {
  const createUseCase = () => {
    const authTokenService = {
      createUserToken: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<AuthTokenService>;

    const userService = {
      checkCredentials: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    const ctx: UowContext = { tx: Symbol("tx") };
    const uow: jest.Mocked<UnitOfWorkPort> = {
      runInTransaction: jest.fn(async (fn) => fn(ctx)),
    } as unknown as jest.Mocked<UnitOfWorkPort>;

    const useCase = new AuthUseCase(uow, authTokenService, userService);

    return { useCase, authTokenService, userService, uow, ctx };
  };

  it("should authenticate user when password matches", async () => {
    const { useCase, userService, authTokenService, uow, ctx } = createUseCase();
    const userId = "usr_123" as Cuid2;
    userService.checkCredentials.mockResolvedValue(userId);
    const authEntity = { accessToken: "access" } as any;
    authTokenService.createUserToken.mockResolvedValue(authEntity);

    const input = { email: "user@example.com", password: "plain", rememberMe: true };
    const result = await useCase.login(input);

    expect(uow.runInTransaction).toHaveBeenCalledTimes(2);
    expect(userService.checkCredentials).toHaveBeenCalledWith(input.email, input.password, ctx);
    expect(authTokenService.createUserToken).toHaveBeenCalledWith({ userId, remember: true }, ctx);
    expect(result).toBe(authEntity);
  });

  it("should throw when password verification fails", async () => {
    const { useCase, userService, authTokenService, ctx } = createUseCase();
    userService.checkCredentials.mockRejectedValue(new AuthLoginInvalidCredentialError({} as any));

    const action = useCase.login({ email: "user@example.com", password: "bad", rememberMe: false });

    await expect(action).rejects.toBeInstanceOf(AuthLoginInvalidCredentialError);
    expect(authTokenService.createUserToken).not.toHaveBeenCalled();
    expect(userService.checkCredentials).toHaveBeenCalledWith("user@example.com", "bad", ctx);
  });

  it("should create auth token for user", async () => {
    const { useCase, authTokenService, uow, ctx } = createUseCase();
    const authEntity = { accessToken: "access" } as any;
    authTokenService.createUserToken.mockResolvedValue(authEntity);

    const result = await useCase.createAuthTokenForUser("usr_123" as Cuid2, true);

    expect(uow.runInTransaction).toHaveBeenCalled();
    expect(authTokenService.createUserToken).toHaveBeenCalledWith(
      { userId: "usr_123", remember: true },
      ctx,
    );
    expect(result).toBe(authEntity);
  });

  it("should default remember flag to false when omitted", async () => {
    const { useCase, authTokenService, uow, ctx } = createUseCase();
    const authEntity = { accessToken: "access" } as any;
    authTokenService.createUserToken.mockResolvedValue(authEntity);

    const result = await useCase.createAuthTokenForUser("usr_default" as Cuid2);

    expect(uow.runInTransaction).toHaveBeenCalled();
    expect(authTokenService.createUserToken).toHaveBeenCalledWith(
      { userId: "usr_default", remember: false },
      ctx,
    );
    expect(result).toBe(authEntity);
  });

  it("should refresh tokens when valid", async () => {
    const { useCase, authTokenService, uow, ctx } = createUseCase();
    const authEntity = { accessToken: "new-access" } as any;
    authTokenService.refreshTokens.mockResolvedValue({ authEntity, rotated: true });

    const result = await useCase.refreshFromToken("refresh" as any);

    expect(uow.runInTransaction).toHaveBeenCalled();
    expect(authTokenService.refreshTokens).toHaveBeenCalledWith("refresh", ctx);
    expect(result).toEqual({ authEntity, rotated: true });
  });

  it("should throw when refresh token invalid", async () => {
    const { useCase, authTokenService } = createUseCase();
    authTokenService.refreshTokens.mockResolvedValue(null);

    await expect(useCase.refreshFromToken("bad" as any)).rejects.toBeInstanceOf(
      AuthRefreshTokenInvalidOrExpiredError,
    );
  });

  it("should logout via token service", async () => {
    const { useCase, authTokenService, uow, ctx } = createUseCase();

    await useCase.logout("refresh" as any);

    expect(uow.runInTransaction).toHaveBeenCalled();
    expect(authTokenService.logout).toHaveBeenCalledWith("refresh", ctx);
  });
});
