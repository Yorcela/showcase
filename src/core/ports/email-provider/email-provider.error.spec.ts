import { HttpStatus } from "@nestjs/common";

import {
  EmailProviderError,
  EmailProviderErrorCode,
  EmailProviderErrorMessageMap,
  EmailProviderSendEmailFailureError,
} from "./email-provider.error";

class ConcreteEmailProviderError extends EmailProviderError {
  constructor() {
    super(EmailProviderErrorCode.EMAIL_SEND_FAILURE, { foo: "bar" }, HttpStatus.I_AM_A_TEAPOT);
  }
}

class MinimalEmailProviderError extends EmailProviderError {
  constructor() {
    super(EmailProviderErrorCode.EMAIL_SEND_FAILURE);
  }
}

class ConcreteSendFailureError extends EmailProviderSendEmailFailureError {}
class CustomMapSendFailureError extends EmailProviderSendEmailFailureError {
  constructor() {
    super({
      [EmailProviderErrorCode.EMAIL_SEND_FAILURE]: "Custom failure",
    });
  }
}

class DirectCustomSendFailureError extends EmailProviderSendEmailFailureError {
  constructor() {
    super(
      {
        [EmailProviderErrorCode.EMAIL_SEND_FAILURE]: "Direct custom",
      },
      { requestId: "123" },
    );
  }
}

describe("EmailProviderError", () => {
  it("should serialize base Error with custom status", () => {
    // Given / When
    const Error = new ConcreteEmailProviderError();

    // Then
    const json = (Error as any).toJSON();
    expect(json.code).toBe(EmailProviderErrorCode.EMAIL_SEND_FAILURE);
    expect(json.httpStatus).toBe(HttpStatus.I_AM_A_TEAPOT);
    expect(json.context).toEqual({ foo: "bar" });
  });

  it("should default to internal server error for send failure", () => {
    // Given
    const Error = new ConcreteSendFailureError();

    // When
    const json = (Error as any).toJSON();

    // Then
    expect(json.httpStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json.message).toContain(
      EmailProviderErrorMessageMap[EmailProviderErrorCode.EMAIL_SEND_FAILURE],
    );
  });

  it("should allow custom message map overrides", () => {
    // Given
    const Error = new CustomMapSendFailureError();

    // When
    const json = (Error as any).toJSON();

    // Then
    expect(json.message).toContain("Custom failure");
  });

  it("should allow passing custom map directly", () => {
    const Error = new DirectCustomSendFailureError();
    const json = (Error as any).toJSON();
    expect(json.message).toContain("Direct custom");
    expect(json.context).toEqual({ requestId: "123" });
  });

  it("should default http status and message when only code provided", () => {
    const Error = new MinimalEmailProviderError();

    expect(Error.httpStatus).toBe(HttpStatus.BAD_REQUEST);
    expect(Error.message).toContain(
      EmailProviderErrorMessageMap[EmailProviderErrorCode.EMAIL_SEND_FAILURE],
    );
  });
});
