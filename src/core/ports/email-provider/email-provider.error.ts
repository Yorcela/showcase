import { HttpStatus } from "@nestjs/common";

import {
  ErrorCodeName,
  ErrorCodeType,
  ErrorCodeValue,
  ErrorMessageMap,
  AbstractAppError,
  ErrorContextType,
} from "@shared/core/abstract/error.abstract";

export type EmailProviderErrorCodeName = ErrorCodeName<typeof EmailProviderErrorCode>;
export type EmailProviderErrorCodeValue = ErrorCodeValue<typeof EmailProviderErrorCode>;

export const EmailProviderErrorCode: ErrorCodeType = {
  EMAIL_SEND_FAILURE: "MAIL_001",
  EMAIL_TRANSPORTER_FAILURE: "MAIL_002",
};

export const EmailProviderErrorMessageMap: ErrorMessageMap<EmailProviderErrorCodeValue> = {
  [EmailProviderErrorCode.EMAIL_SEND_FAILURE]: "Mail provider failed to send email",
  [EmailProviderErrorCode.EMAIL_TRANSPORTER_FAILURE]: "Mail provider unknown transporter error",
};

export abstract class EmailProviderError extends AbstractAppError<EmailProviderErrorCodeValue> {
  constructor(
    public readonly code: EmailProviderErrorCodeValue,
    public readonly context?: ErrorContextType,
    public readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
    messageMap?: ErrorMessageMap<EmailProviderErrorCodeValue>,
  ) {
    super(messageMap ?? EmailProviderErrorMessageMap, code, context, httpStatus);
  }
}

export abstract class EmailProviderSendEmailFailureError extends EmailProviderError {
  constructor(
    messageMap: ErrorMessageMap<EmailProviderErrorCodeValue> = EmailProviderErrorMessageMap,
    context?: ErrorContextType,
  ) {
    super(
      EmailProviderErrorCode.EMAIL_SEND_FAILURE,
      context,
      HttpStatus.INTERNAL_SERVER_ERROR,
      messageMap,
    );
  }
}

export abstract class EmailProviderUnknownTransporterError extends EmailProviderError {
  constructor(
    messageMap: ErrorMessageMap<EmailProviderErrorCodeValue> = EmailProviderErrorMessageMap,
    context?: ErrorContextType,
  ) {
    super(
      EmailProviderErrorCode.EMAIL_TRANSPORTER_FAILURE,
      context,
      HttpStatus.INTERNAL_SERVER_ERROR,
      messageMap,
    );
  }
}
