import { HttpStatus } from "@nestjs/common";

import { AbstractAppError, ErrorContextType } from "@shared/core/abstract/error.abstract";

import { AuthErrorCodeValue, AuthErrorMessageMap } from "./registry.errors";

export abstract class AbstractAuthError extends AbstractAppError<AuthErrorCodeValue> {
  protected constructor(
    code: AuthErrorCodeValue,
    context?: ErrorContextType,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(AuthErrorMessageMap, code, context, httpStatus);
  }
}
