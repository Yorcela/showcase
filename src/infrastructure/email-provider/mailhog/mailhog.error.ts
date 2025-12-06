import {
  EmailProviderErrorCode,
  EmailProviderErrorCodeValue,
  EmailProviderSendEmailFailureError,
  EmailProviderUnknownTransporterError,
} from "@ports/email-provider/email-provider.error";
import { ErrorContextType, ErrorMessageMap } from "@shared/core/abstract/error.abstract";

export const MailHogErrorMessageMap: ErrorMessageMap<EmailProviderErrorCodeValue> = {
  [EmailProviderErrorCode.EMAIL_SEND_FAILURE]: "MailHog: Failed to send email",
  [EmailProviderErrorCode.EMAIL_TRANSPORTER_FAILURE]: "MailHog: Unknown transporter error",
};

export class MailHogUnknownTransporterError extends EmailProviderUnknownTransporterError {
  constructor(public readonly context?: ErrorContextType) {
    super(MailHogErrorMessageMap, context);
  }
}
export class MailHogSendEmailFailureError extends EmailProviderSendEmailFailureError {
  constructor(public readonly context?: ErrorContextType) {
    super(MailHogErrorMessageMap, context);
  }
}
