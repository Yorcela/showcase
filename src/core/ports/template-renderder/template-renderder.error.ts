import { HttpStatus } from "@nestjs/common";

import {
  ErrorCodeName,
  ErrorCodeType,
  ErrorCodeValue,
  ErrorMessageMap,
  AbstractAppError,
  ErrorContextType,
} from "@shared/core/abstract/error.abstract";

export type TemplateRendererErrorCodeName = ErrorCodeName<typeof TemplateRendererErrorCode>;
export type TemplateRendererErrorCodeValue = ErrorCodeValue<typeof TemplateRendererErrorCode>;

export const TemplateRendererErrorCode: ErrorCodeType = {
  TEMPLATE_NOT_FOUND: "TPLRND_TPL_001",
};

export const TemplateRendererErrorMessageMap: ErrorMessageMap<TemplateRendererErrorCodeValue> = {
  [TemplateRendererErrorCode.TEMPLATE_NOT_FOUND]: "Template not found",
};

export abstract class TemplateRendererError extends AbstractAppError<TemplateRendererErrorCodeValue> {
  constructor(
    public readonly code: TemplateRendererErrorCodeValue,
    public readonly context?: ErrorContextType,
    public readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
    messageMap?: ErrorMessageMap<TemplateRendererErrorCodeValue>,
  ) {
    super(messageMap ?? TemplateRendererErrorMessageMap, code, context, httpStatus);
  }
}

export abstract class TemplateRendererSendEmailFailureError extends TemplateRendererError {
  constructor(
    messageMap: ErrorMessageMap<TemplateRendererErrorCodeValue> = TemplateRendererErrorMessageMap,
    context?: ErrorContextType,
  ) {
    super(TemplateRendererErrorCode.TEMPLATE_NOT_FOUND, context, HttpStatus.NOT_FOUND, messageMap);
  }
}
