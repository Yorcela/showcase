import { UnitOfWorkPort, UowContext } from "@ports/unit-of-work/unit-of-work.port";

import { UserService } from "@modules/user/application/services/user.service";

import { SecuredToken } from "@apptypes/secured-token.type";
import { RegistrationUseCase } from "./register.usecase";
import { EmailVerificationEntity } from "../../domain/entities/email-verification.entity";
import { OtpEntity } from "../../domain/entities/otp.entity";
import {
  AuthRegisterVerificationAlreadyVerifiedError,
  AuthRegisterVerificatioCodeInvalidnError,
  AuthRegisterVerificationCodeInvalidOrExpiredError,
} from "../../domain/errors/register.error";
import {
  AuthRegisterInputDto,
  AuthVerifyEmailInputDto,
} from "../../interfaces/presenters/dto/register.dto";
import { AccountVerificationService } from "../services/account-verification.service";
import { AuthEmailService } from "../services/email.service";

describe("RegistrationUseCase", () => {
  const createUseCase = () => {
    const userService = {
      findOrCreate: jest.fn().mockResolvedValue({
        id: "user-default",
        email: "default@example.com",
        isActive: false,
        isPendingVerification: true,
      }),
      activate: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserService>;

    const accountVerificationService = {
      createForUser: jest.fn(),
      getFromToken: jest.fn(),
      consumeToken: jest.fn(),
    } as unknown as jest.Mocked<AccountVerificationService>;

    const verificationService = {
      sendVerificationEmail: jest.fn(),
    } as unknown as jest.Mocked<AuthEmailService>;

    const ctx: UowContext = { tx: Symbol("tx") };
    const uow: jest.Mocked<UnitOfWorkPort> = {
      runInTransaction: jest.fn(async (fn) => fn(ctx)),
    } as unknown as jest.Mocked<UnitOfWorkPort>;

    const useCase = new RegistrationUseCase(
      uow,
      userService,
      accountVerificationService,
      verificationService,
    );

    return {
      useCase,
      userService,
      accountVerificationService,
      verificationService,
      uow,
      ctx,
    };
  };

  it("should throw when user already verified", async () => {
    // Given
    const { useCase, userService, accountVerificationService, verificationService, uow, ctx } =
      createUseCase();
    const input = new AuthRegisterInputDto();
    input.email = "user@example.com";
    userService.findOrCreate = jest.fn().mockResolvedValue({
      id: "user-1",
      email: input.email,
      isActive: true,
      isPendingVerification: false,
    });

    // When
    const action = useCase.registerEmail(input);

    // Then
    await expect(action).rejects.toThrow(AuthRegisterVerificationAlreadyVerifiedError);
    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
    expect(userService.findOrCreate).toHaveBeenCalledWith(input.email, ctx);
    expect(accountVerificationService.createForUser).not.toHaveBeenCalled();
    expect(verificationService.sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("should generate otp and send verification email for pending user", async () => {
    // Given
    const { useCase, userService, accountVerificationService, verificationService, ctx, uow } =
      createUseCase();
    const input = new AuthRegisterInputDto();
    input.email = "User@example.com";
    const user = {
      id: "user-2",
      email: input.email,
      isActive: false,
      isPendingVerification: true,
    };
    userService.findOrCreate = jest.fn().mockResolvedValue(user);
    const token = "token-xyz" as SecuredToken;
    const otp = new OtpEntity("654321", token, new Date("2025-01-01T00:00:00.000Z"));
    accountVerificationService.createForUser = jest.fn().mockResolvedValue(otp);

    // When
    const result = await useCase.registerEmail(input);

    // Then
    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
    expect(userService.findOrCreate).toHaveBeenCalledWith(input.email, ctx);
    expect(accountVerificationService.createForUser).toHaveBeenCalledWith(
      user.id,
      input.email,
      ctx,
    );
    expect(verificationService.sendVerificationEmail).toHaveBeenCalledWith({
      email: input.email,
      otp,
    });
    expect(result.email).toBe(user.email);
    expect(result.verificationToken).toBe(otp.token);
    expect(result.expiresAt).toBe(otp.expiresAt);
  });

  it("should return user without otp workflow when verification not pending", async () => {
    // Given
    const { useCase, userService, accountVerificationService, verificationService, ctx, uow } =
      createUseCase();
    const input = new AuthRegisterInputDto();
    input.email = "user@example.com";
    const user = {
      id: "user-3",
      email: input.email,
      isActive: false,
      isPendingVerification: false,
    };
    userService.findOrCreate = jest.fn().mockResolvedValue(user);

    // When
    const result = await useCase.registerEmail(input);

    // Then
    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
    expect(userService.findOrCreate).toHaveBeenCalledWith(input.email, ctx);
    expect(accountVerificationService.createForUser).not.toHaveBeenCalled();
    expect(verificationService.sendVerificationEmail).not.toHaveBeenCalled();
    expect(result.email).toBe(user.email);
    expect(result.verificationToken).toBeNull();
    expect(result.expiresAt).toBeNull();
  });

  describe("verifyEmail", () => {
    it("should throw when token not found", async () => {
      // Given
      const { useCase, accountVerificationService, uow, ctx } = createUseCase();
      const input = new AuthVerifyEmailInputDto();
      input.email = "verified@example.com";
      input.code = "123456";
      input.verificationToken = "token";
      accountVerificationService.getFromToken = jest
        .fn()
        .mockRejectedValue(new AuthRegisterVerificationCodeInvalidOrExpiredError());

      // When
      await expect(useCase.verifyEmail(input)).rejects.toThrow(
        AuthRegisterVerificationCodeInvalidOrExpiredError,
      );

      // Then
      expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
      expect(accountVerificationService.getFromToken).toHaveBeenCalledWith("token", ctx);
      expect(accountVerificationService.consumeToken).not.toHaveBeenCalled();
    });

    it("should consume token and return entity when otp is valid", async () => {
      // Given
      const { useCase, accountVerificationService, uow, ctx } = createUseCase();
      const input = new AuthVerifyEmailInputDto();
      input.email = "pending@example.com";
      input.code = "123456";
      input.verificationToken = "token";
      const entity = {
        isValid: jest.fn().mockReturnValue(true),
      } as unknown as EmailVerificationEntity;
      accountVerificationService.getFromToken = jest.fn().mockResolvedValue(entity);

      // When
      const result = await useCase.verifyEmail(input);

      // Then
      expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
      expect(accountVerificationService.getFromToken).toHaveBeenCalledWith("token", ctx);
      expect(entity.isValid).toHaveBeenCalledWith(input.code, input.email);
      expect(accountVerificationService.consumeToken).toHaveBeenCalledWith("token", ctx);
      expect(result).toBe(entity);
    });

    it("should not consume token when otp is invalid", async () => {
      // Given
      const { useCase, accountVerificationService, uow, ctx } = createUseCase();
      const input = new AuthVerifyEmailInputDto();
      input.email = "other@example.com";
      input.code = "invalid";
      input.verificationToken = "token";
      const entity = {
        isValid: jest.fn().mockReturnValue(false),
      } as unknown as EmailVerificationEntity;
      accountVerificationService.getFromToken = jest.fn().mockResolvedValue(entity);

      // When
      await expect(useCase.verifyEmail(input)).rejects.toThrow(
        AuthRegisterVerificatioCodeInvalidnError,
      );

      // Then
      expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
      expect(accountVerificationService.getFromToken).toHaveBeenCalledWith("token", ctx);
      expect(entity.isValid).toHaveBeenCalledWith(input.code, input.email);
      expect(accountVerificationService.consumeToken).not.toHaveBeenCalled();
    });
  });
});
