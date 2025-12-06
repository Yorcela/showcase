import { Response } from "express";

import { REFRESH_COOKIE_NAME } from "@infrastructure/http/cookies/cookie.config";
import { AppConfig } from "@shared/modules/config/app.config";
import { Cuid2 } from "@apptypes/cuid2.type";
import { SecuredToken } from "@apptypes/secured-token.type";
import { AuthController } from "./auth.controller";
import { AuthUseCase } from "../../application/usecases/auth.usecase";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { AuthLoginInvalidCredentialError } from "../../domain/errors/login.error";
import { AuthLoginSuccess, AuthLogoutSuccess } from "../../domain/success/login.success";
import { AuthSuccessCode } from "../../domain/success/registry.success";
import { LoginInputDto, AuthTokenPayloadDto } from "../presenters/dto/login.dto";

describe("AuthController (integration-ish)", () => {
  let controller: AuthController;
  let authUseCase: jest.Mocked<AuthUseCase>;
  let appConfig: jest.Mocked<AppConfig>;

  beforeEach(() => {
    authUseCase = {
      login: jest.fn(),
      refreshFromToken: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<AuthUseCase>;

    appConfig = {
      isProduction: jest.fn().mockReturnValue(false),
      getApiPrefix: jest.fn().mockReturnValue("api"),
      getFrontendUrl: jest.fn().mockReturnValue("http://localhost:4200"),
      getAppUrl: jest.fn().mockReturnValue("http://localhost:3000"),
    } as unknown as jest.Mocked<AppConfig>;

    controller = new AuthController(authUseCase, appConfig);
  });

  it("should login user successfully", async () => {
    const input: LoginInputDto = { email: "user@example.com", password: "pwd", rememberMe: true };
    const auth = AuthEntity.fromRaw({
      accessToken: "access",
      refreshToken: "refresh",
      sessionId: "ses_123" as Cuid2,
      refreshTokenExpiresAt: 42,
    });
    authUseCase.login.mockResolvedValue(auth);

    const res = createResponse();

    const result = await controller.login(input, res as Response);

    expect(authUseCase.login).toHaveBeenCalledWith(input);
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      auth.refreshToken,
      expect.any(Object),
    );
    expect(result).toBeInstanceOf(AuthLoginSuccess);
    expect(result.code).toBe(AuthSuccessCode.LOGIN_SUCCESSFUL);
    expect(result.payload).toEqual(AuthTokenPayloadDto.of({ accessToken: auth.accessToken }));
  });

  it("should propagate login errors", async () => {
    const input: LoginInputDto = {
      email: "user@example.com",
      password: "pwd",
      rememberMe: false,
    };
    authUseCase.login.mockRejectedValue(new AuthLoginInvalidCredentialError());

    const res = createResponse();
    await expect(controller.login(input, res as Response)).rejects.toBeInstanceOf(
      AuthLoginInvalidCredentialError,
    );
  });

  it("should refresh token", async () => {
    const res = createResponse();
    const auth = AuthEntity.fromRaw({
      accessToken: "new-access",
      refreshToken: "new-refresh",
      sessionId: "ses_1" as Cuid2,
      refreshTokenExpiresAt: Date.now() + 5_000,
    });
    authUseCase.refreshFromToken.mockResolvedValue({ authEntity: auth, rotated: true });

    const result = await controller.refresh("refresh" as SecuredToken, res as Response);

    expect(authUseCase.refreshFromToken).toHaveBeenCalledWith("refresh");
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      auth.refreshToken,
      expect.any(Object),
    );
    expect(result.payload.accessToken).toBe("new-access");
  });

  it("should clear cookie on logout", async () => {
    const res = createResponse();

    const result = await controller.logout("refresh" as SecuredToken, res as Response);

    expect(authUseCase.logout).toHaveBeenCalledWith("refresh");
    expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME, expect.any(Object));
    expect(result).toBeInstanceOf(AuthLogoutSuccess);
  });

  function createResponse() {
    return {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as Partial<Response>;
  }
});
