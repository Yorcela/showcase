import { BadRequestException, ValidationPipe } from "@nestjs/common";

import { UserEntity, UserRole, UserStatus } from "@modules/user/domain/entities/user.entity";

import { AppConfig } from "@shared/modules/config/app.config";
import { Cuid2 } from "@apptypes/cuid2.type";
import { SecuredToken } from "@apptypes/secured-token.type";
import { RegistrationController } from "./register.controller";
import { AuthUseCase } from "../../application/usecases/auth.usecase";
import { RegistrationUseCase } from "../../application/usecases/register.usecase";
import {
  AuthRegisterEmailExistError,
  AuthRegisterEmailSendFailedError,
} from "../../domain/errors/register.error";
import { AuthRegisterSuccess } from "../../domain/success/register.success";
import { AuthSuccessCode } from "../../domain/success/registry.success";
import { AuthRegisterInputDto } from "../presenters/dto/register.dto";

describe("RegistrationController", () => {
  let controller: RegistrationController;
  let registerUseCase: jest.Mocked<RegistrationUseCase>;
  let authUseCase: jest.Mocked<AuthUseCase>;
  let appConfig: jest.Mocked<AppConfig>;

  beforeEach(() => {
    registerUseCase = {
      registerEmail: jest.fn(),
    } as unknown as jest.Mocked<RegistrationUseCase>;
    authUseCase = {
      createAuthTokenForUser: jest.fn(),
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

    controller = new RegistrationController(registerUseCase, authUseCase, appConfig);
  });

  it("should register email successfully", async () => {
    // Given
    const user = new UserEntity({
      id: "user-123" as Cuid2,
      email: "john.doe@example.com",
      passwordHash: "hashed",
      status: UserStatus.PENDING_VERIFICATION,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const verificationToken = "token-123" as SecuredToken;
    const expiresAt = new Date("2025-01-01T00:00:00.000Z");
    registerUseCase.registerEmail.mockResolvedValue({
      email: user.email,
      verificationToken,
      expiresAt,
    });
    const input = new AuthRegisterInputDto();
    input.email = user.email;

    // When
    const result = await controller.registerEmail(input);

    // Then
    const expectedCode = AuthSuccessCode.REGISTRATION_SUCCESSFUL;
    expect(registerUseCase.registerEmail).toHaveBeenCalledTimes(1);
    expect(registerUseCase.registerEmail).toHaveBeenCalledWith(input);
    expect(result).toBeInstanceOf(AuthRegisterSuccess);
    expect(result.code).toBe(expectedCode);
    expect(result.payload.email).toBe(user.email);
    expect(result.payload.verificationToken).toBe(verificationToken);
    expect(result.payload.expiresAt).toBe(expiresAt);
  });

  it("should throw when email format is invalid", async () => {
    // Given
    const payload = { email: "invalid-email" };
    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    // When
    const action = async () => {
      const dto = await validationPipe.transform(payload, {
        type: "body",
        metatype: AuthRegisterInputDto,
      });
      await controller.registerEmail(dto as AuthRegisterInputDto);
    };

    // Then
    const expected = BadRequestException;
    await expect(action()).rejects.toThrow(expected);
    expect(registerUseCase.registerEmail).not.toHaveBeenCalled();
  });

  it("should throw when email already exists", async () => {
    // Given
    const input = new AuthRegisterInputDto();
    input.email = "existing.user@example.com";
    const error = new AuthRegisterEmailExistError();
    registerUseCase.registerEmail.mockRejectedValue(error);

    // When
    const action = controller.registerEmail(input);

    // Then
    const expected = AuthRegisterEmailExistError;
    await expect(action).rejects.toThrow(expected);
    expect(registerUseCase.registerEmail).toHaveBeenCalledTimes(1);
    expect(registerUseCase.registerEmail).toHaveBeenCalledWith(input);
  });

  it("should throw when verification email cannot be sent", async () => {
    // Given
    const input = new AuthRegisterInputDto();
    input.email = "pending.user@example.com";
    const error = new AuthRegisterEmailSendFailedError();
    registerUseCase.registerEmail.mockRejectedValue(error);

    // When
    const action = controller.registerEmail(input);

    // Then
    const expected = AuthRegisterEmailSendFailedError;
    await expect(action).rejects.toThrow(expected);
    expect(registerUseCase.registerEmail).toHaveBeenCalledTimes(1);
    expect(registerUseCase.registerEmail).toHaveBeenCalledWith(input);
  });
});
