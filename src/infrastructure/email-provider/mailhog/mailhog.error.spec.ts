import { HttpStatus } from "@nestjs/common";

import { EmailProviderErrorCode } from "@ports/email-provider/email-provider.error";

import {
  MailHogErrorMessageMap,
  MailHogSendEmailFailureError,
  MailHogUnknownTransporterError,
} from "./mailhog.error";

describe("MailHog errors", () => {
  it("should serialize MailHog send failure error with context", () => {
    // Given
    const context = { provider: "mailhog" };
    const error = new MailHogSendEmailFailureError(context);

    // When
    const result = (error as any).toJSON();

    // Then
    const expectedMessage = MailHogErrorMessageMap[EmailProviderErrorCode.EMAIL_SEND_FAILURE];
    const expected = {
      name: "MailHogSendEmailFailureError",
      code: EmailProviderErrorCode.EMAIL_SEND_FAILURE,
      message: expectedMessage,
      context,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    };
    expect(result).toEqual(expected);
  });

  it("should expose swagger metadata for MailHog send failure error", () => {
    // Given
    const expected = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      example: {
        code: EmailProviderErrorCode.EMAIL_SEND_FAILURE,
        message: MailHogErrorMessageMap[EmailProviderErrorCode.EMAIL_SEND_FAILURE],
      },
    };

    // When
    const result = MailHogSendEmailFailureError.toSwagger();

    // Then
    expect(result).toEqual(expected);
  });

  it("should expose swagger metadata for MailHog transporter unknown error", () => {
    // Given
    const expected = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      example: {
        code: EmailProviderErrorCode.EMAIL_TRANSPORTER_FAILURE,
        message: MailHogErrorMessageMap[EmailProviderErrorCode.EMAIL_TRANSPORTER_FAILURE],
      },
    };

    // When
    const result = MailHogUnknownTransporterError.toSwagger();

    // Then
    expect(result).toEqual(expected);
  });
});
