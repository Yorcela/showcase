import { Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

import { EmailProviderErrorCode } from "@ports/email-provider/email-provider.error";
import { AppConfig } from "@shared/modules/config/app.config";

import { EmailMailhogAdapter } from "./mailhog.adapter";
import { MailHogSendEmailFailureError, MailHogUnknownTransporterError } from "./mailhog.error";

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

describe("EmailMailhogAdapter", () => {
  let appConfigMock: jest.Mocked<AppConfig>;
  let sendMailMock: jest.Mock;
  const loggerErrorSpy = jest
    .spyOn(Logger.prototype, "error")
    .mockImplementation(() => undefined as unknown as void);

  beforeEach(() => {
    appConfigMock = {
      getMailhogHost: jest.fn().mockReturnValue("mailhog.local"),
      getMailhogPort: jest.fn().mockReturnValue(1025),
      getEmailFrom: jest.fn().mockReturnValue("noreply@tallae.com"),
    } as unknown as jest.Mocked<AppConfig>;

    sendMailMock = jest.fn().mockResolvedValue(undefined);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    loggerErrorSpy.mockRestore();
  });

  it("should send email using default from address and log success", async () => {
    const adapter = new EmailMailhogAdapter(appConfigMock);
    const email = {
      to: "john@example.com",
      subject: "Welcome",
      html: "<p>Hello</p>",
    };

    await expect(adapter.send(email)).resolves.toBeUndefined();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "mailhog.local",
      port: 1025,
      secure: false,
      ignoreTLS: true,
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: "noreply@tallae.com",
      to: "john@example.com",
      subject: "Welcome",
      html: "<p>Hello</p>",
      text: undefined,
      cc: undefined,
      bcc: undefined,
      replyTo: undefined,
    });
  });

  it("should convert array recipients and include optional fields", async () => {
    const adapter = new EmailMailhogAdapter(appConfigMock);
    const email = {
      from: "sender@example.com",
      to: ["a@example.com", "b@example.com"],
      subject: "Subject",
      html: "<p>HTML</p>",
      text: "Plain",
      cc: ["cc@example.com"],
      bcc: ["bcc@example.com"],
      replyTo: "reply@example.com",
    };

    await adapter.send(email);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: "sender@example.com",
      to: "a@example.com, b@example.com",
      subject: "Subject",
      html: "<p>HTML</p>",
      text: "Plain",
      cc: "cc@example.com",
      bcc: "bcc@example.com",
      replyTo: "reply@example.com",
    });
  });

  it("should wrap transport failures and log errors", async () => {
    const errorMsg = "Transport failure";
    const error = new Error(errorMsg);
    sendMailMock.mockRejectedValueOnce(error);
    const adapter = new EmailMailhogAdapter(appConfigMock);
    const context = { to: "user@example.com", html: "", subject: "Fail" };

    await expect(adapter.send(context)).rejects.toBeInstanceOf(MailHogSendEmailFailureError);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringContaining(EmailProviderErrorCode.EMAIL_SEND_FAILURE),
      { email: context, error },
    );
  });

  it("should handle non-error rejections with generic reason", async () => {
    const errorMsg = "this is an error message";
    sendMailMock.mockRejectedValueOnce(errorMsg);
    const adapter = new EmailMailhogAdapter(appConfigMock);
    const context = { to: "user@example.com", html: "", subject: "Fail" };

    await expect(adapter.send(context)).rejects.toBeInstanceOf(MailHogUnknownTransporterError);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringContaining(EmailProviderErrorCode.EMAIL_TRANSPORTER_FAILURE),
      { email: context, error: errorMsg },
    );
  });
});
