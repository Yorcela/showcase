import { SecuredToken } from "@apptypes/secured-token.type";
import { AccountVerificationService } from "./account-verification.service";
import { EmailVerificationEntity } from "../../domain/entities/email-verification.entity";
import {
  AuthPersistenceFailureError,
  AuthRegisterVerificationCodeInvalidOrExpiredError,
} from "../../domain/errors/register.error";
import { OtpGeneratorService } from "../../domain/services/otp-generator.service";
import { EmailVerificationRepoPort } from "../ports/email-verification.repo.port";

describe("AccountVerificationService", () => {
  const createService = () => {
    const repo = {
      create: jest.fn().mockResolvedValue(undefined),
      findValidByTokenHash: jest.fn(),
      consume: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EmailVerificationRepoPort>;

    const expiresAt = new Date("2025-01-01T10:00:00.000Z");
    const generator = {
      generateFullOtpCode: jest.fn().mockReturnValue({
        code: "123456",
        token: "secure-token" as SecuredToken,
        tokenHash: "hash",
        expiresAt,
      }),
      getHashedToken: jest.fn().mockReturnValue("hashed"),
    } as unknown as jest.Mocked<OtpGeneratorService>;

    const service = new AccountVerificationService(repo, generator);
    return { service, repo, generator, expiresAt };
  };

  it("should generate otp and persist verification entry", async () => {
    // Given
    const { service, repo, generator, expiresAt } = createService();
    const userId = "user-123";
    const email = "USER@example.com";

    // When
    const otp = await service.createForUser(userId, email);

    // Then
    const expectedLowerEmail = "user@example.com";
    expect(generator.generateFullOtpCode).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith(
      {
        userId,
        email: expectedLowerEmail,
        code: "123456",
        tokenHash: "hash",
        expiresAt,
      },
      undefined,
    );
    const expectedCode = "123456";
    expect(otp.code).toBe(expectedCode);
    expect(otp.token).toBe("secure-token");
    expect(otp.expiresAt).toBe(expiresAt);
  });

  it("should unwrap repository errors when creation fails", async () => {
    const { service, repo } = createService();
    repo.create.mockRejectedValueOnce(new Error("db failure"));

    await expect(service.createForUser("user", "mail@example.com")).rejects.toBeInstanceOf(
      AuthPersistenceFailureError,
    );
  });

  it("should retrieve verification token and throw when missing", async () => {
    const { service, repo, generator } = createService();
    const entity = {
      id: "verif",
    } as unknown as EmailVerificationEntity;
    repo.findValidByTokenHash.mockResolvedValueOnce(entity);

    const token = "secure-token" as SecuredToken;
    const found = await service.getFromToken(token);
    expect(generator.getHashedToken).toHaveBeenCalledWith(token);
    expect(found).toBe(entity);

    repo.findValidByTokenHash.mockResolvedValueOnce(null);
    await expect(service.getFromToken(token)).rejects.toBeInstanceOf(
      AuthRegisterVerificationCodeInvalidOrExpiredError,
    );
  });

  it("should consume token and surface persistence errors", async () => {
    const { service, repo, generator } = createService();
    const token = "secure-token" as SecuredToken;

    await expect(service.consumeToken(token)).resolves.toBeUndefined();
    expect(generator.getHashedToken).toHaveBeenCalledWith(token);
    expect(repo.consume).toHaveBeenCalledWith("hashed", undefined);

    repo.consume.mockRejectedValueOnce(new Error("boom"));
    await expect(service.consumeToken(token)).rejects.toBeInstanceOf(AuthPersistenceFailureError);
  });
});
