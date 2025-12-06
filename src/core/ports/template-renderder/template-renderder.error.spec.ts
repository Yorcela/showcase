import { HttpStatus } from "@nestjs/common";

import {
  TemplateRendererError,
  TemplateRendererErrorCode,
  TemplateRendererErrorMessageMap,
  TemplateRendererSendEmailFailureError,
} from "./template-renderder.error";

describe("TemplateRendererError hierarchy", () => {
  class ConcreteTemplateError extends TemplateRendererError {
    constructor() {
      super(TemplateRendererErrorCode.TEMPLATE_NOT_FOUND, { template: "auth/verify-email" });
    }
  }

  it("should expose default message and context", () => {
    const error = new ConcreteTemplateError();

    expect(error.message).toBe(
      TemplateRendererErrorMessageMap[TemplateRendererErrorCode.TEMPLATE_NOT_FOUND],
    );
    expect(error.context).toEqual({ template: "auth/verify-email" });
    expect(error.httpStatus).toBe(HttpStatus.BAD_REQUEST);
  });

  it("should allow overriding message map and http status in subclass", () => {
    class CustomTemplateError extends TemplateRendererError {
      constructor() {
        super(
          TemplateRendererErrorCode.TEMPLATE_NOT_FOUND,
          undefined,
          HttpStatus.INTERNAL_SERVER_ERROR,
          { [TemplateRendererErrorCode.TEMPLATE_NOT_FOUND]: "Custom message" },
        );
      }
    }

    const error = new CustomTemplateError();

    expect(error.message).toBe("Custom message");
    expect(error.httpStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it("should configure send email failure error with not found status", () => {
    class ConcreteSendError extends TemplateRendererSendEmailFailureError {}

    const error = new ConcreteSendError();

    expect(error.code).toBe(TemplateRendererErrorCode.TEMPLATE_NOT_FOUND);
    expect(error.httpStatus).toBe(HttpStatus.NOT_FOUND);
  });
});
