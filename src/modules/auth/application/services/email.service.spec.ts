import { AppConfig } from "@shared/modules/config/app.config";
import { EmailService } from "@shared/modules/email/email.service";

import { SecuredToken } from "@apptypes/secured-token.type";
import { FrontPageUrls, FrontUrlBuilderService } from "@utils/front-url-template.utils";
import { AuthEmailService } from "./email.service";
import { OtpEntity } from "../../domain/entities/otp.entity";
import { AuthRegisterEmailSendFailedError } from "../../domain/errors/register.error";

describe("AuthEmailService", () => {
  const templateId = "auth/verify-email";

  const makeService = () => {
    const emailService = {
      send: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EmailService>;

    const urlBuilder = {
      buildFrontUrl: jest.fn().mockReturnValue("https://frontend/verify?token=abc&code=123456"),
    } as unknown as jest.Mocked<FrontUrlBuilderService>;

    const appConfig = {
      getAppDefaultLanguage: jest.fn().mockReturnValue("en"),
    } as unknown as jest.Mocked<AppConfig>;

    const service = new AuthEmailService(emailService, urlBuilder, appConfig);
    return { service, emailService, urlBuilder, appConfig };
  };

  const createOtp = (expiresAt: Date) =>
    new OtpEntity("123456", "secure-token" as SecuredToken, expiresAt);

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should send verification email using default language and computed expiration", async () => {
    // Given
    const { service, emailService, urlBuilder, appConfig } = makeService();
    const otp = createOtp(new Date("2025-01-01T00:07:30.000Z"));
    const params = { email: "User@example.com", otp };

    // When
    await service.sendVerificationEmail(params);

    // Then
    expect(urlBuilder.buildFrontUrl).toHaveBeenCalledWith(FrontPageUrls.REGISTER_VERIFYEMAIL, {
      token: otp.token,
      code: otp.code,
    });

    expect(emailService.send).toHaveBeenCalledWith(
      templateId,
      {
        code: otp.code,
        verificationLink: "https://frontend/verify?token=abc&code=123456",
        otpExpirationTime: "8",
        lang: "en",
      },
      params.email,
    );
    expect(appConfig.getAppDefaultLanguage).toHaveBeenCalledTimes(1);
  });

  it("should propagate provided language and wrap provider failures", async () => {
    // Given
    const { service, emailService, urlBuilder } = makeService();
    const otp = createOtp(new Date("2025-01-01T00:05:00.000Z"));
    const params = { email: "user@example.com", otp, lang: "fr" };
    const failure = new Error("smtp down");
    emailService.send.mockRejectedValueOnce(failure);

    // When / Then
    await expect(service.sendVerificationEmail(params)).rejects.toThrow(
      AuthRegisterEmailSendFailedError,
    );
    expect(urlBuilder.buildFrontUrl).toHaveBeenCalledWith(FrontPageUrls.REGISTER_VERIFYEMAIL, {
      token: otp.token,
      code: otp.code,
    });
    expect(emailService.send).toHaveBeenCalledWith(
      templateId,
      expect.objectContaining({ lang: "fr" }),
      params.email,
    );
  });
});
