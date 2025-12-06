import { EMAIL_PROVIDER_PORT, EmailOptions, EmailProviderPort } from "./email-provider.port";

describe("EmailProviderPort", () => {
  it("should expose provider symbol", () => {
    expect(typeof EMAIL_PROVIDER_PORT).toBe("symbol");
  });

  it("should define email options shape", () => {
    const email: EmailOptions = {
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
      text: "Hello",
      cc: ["cc@example.com"],
      bcc: ["bcc@example.com"],
      replyTo: "reply@example.com",
    };

    expect(email.to).toBe("user@example.com");
  });

  it("should allow implementation of send", async () => {
    const provider: EmailProviderPort = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      provider.send({ to: "user@example.com", subject: "Test", html: "<p>Ok</p>" }),
    ).resolves.toBeUndefined();
  });
});
