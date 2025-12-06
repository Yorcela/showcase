import { EmailProviderPort, EmailOptions } from "@ports/email-provider/email-provider.port";
import { TemplateRendererPort } from "@ports/template-renderder/template-renderder.port";

import { EmailService } from "./email.service";
import { AppConfig } from "../config/app.config";

describe("EmailService", () => {
  const makeService = () => {
    const provider = {
      send: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EmailProviderPort>;

    const renderer = {
      render: jest.fn().mockResolvedValue({
        html: "<p>Hello</p>",
        subject: "Welcome",
        text: "Hello",
      }),
    } as unknown as jest.Mocked<TemplateRendererPort>;

    const appConfig = {
      getEmailFrom: jest.fn().mockReturnValue("noreply@tallae.com"),
    } as unknown as jest.Mocked<AppConfig>;

    const service = new EmailService(provider, renderer, appConfig);
    return { service, provider, renderer, appConfig };
  };

  it("should render template and delegate to provider with enriched options", async () => {
    // Given
    const { service, provider, renderer, appConfig } = makeService();
    const template = "auth/verify-email" as const;
    const data = {
      code: "123456",
      verificationLink: "https://verify",
      otpExpirationTime: "10",
    };
    const recipient = "user@example.com";

    // When
    await service.send(template, data, recipient);

    // Then
    expect(renderer.render).toHaveBeenCalledWith(template, data);
    const expectedOptions: EmailOptions = {
      to: recipient,
      html: "<p>Hello</p>",
      text: "Hello",
      subject: "[tallae] Welcome",
      from: "noreply@tallae.com",
    };
    expect(provider.send).toHaveBeenCalledWith(expectedOptions);
    expect(appConfig.getEmailFrom).toHaveBeenCalledTimes(1);
  });

  it("should propagate renderer errors", async () => {
    // Given
    const { service, renderer } = makeService();
    const error = new Error("render failed");
    renderer.render.mockRejectedValueOnce(error);

    // When / Then
    const template = "auth/verify-email" as const;
    const data = {
      code: "123456",
      verificationLink: "https://verify",
      otpExpirationTime: "10",
    };

    await expect(service.send(template, data, "user@example.com")).rejects.toThrow(error);
  });
});
