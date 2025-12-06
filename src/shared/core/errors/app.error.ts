import { HttpStatus } from "@nestjs/common";

import { AppErrorCode, AppErrorCodeValue, AppErrorMessageMap } from "./registry.error";
import { AbstractAppError, ErrorContextType } from "../abstract/error.abstract";

// Standard implementation
export abstract class AppError extends AbstractAppError<AppErrorCodeValue> {
  constructor(
    public readonly code: AppErrorCodeValue,
    public readonly context?: ErrorContextType,
    public readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(AppErrorMessageMap, code, context, httpStatus);
  }
}
// Validators
export class ValidatorInvalidEmailError extends AppError {
  constructor(public readonly context?: ErrorContextType) {
    super(AppErrorCode.VALIDATOR_EMAIL_ERROR, context);
  }
}
export class ValidatorInvalidJwtError extends AppError {
  constructor(public readonly context?: ErrorContextType) {
    super(AppErrorCode.VALIDATOR_JWT_ERROR, context);
  }
}
export class ValidatorInvalidHexTokenError extends AppError {
  constructor(public readonly context?: ErrorContextType) {
    super(AppErrorCode.VALIDATOR_HEXTOKEN_ERROR, context);
  }
}
export class ValidatorInvalidCuidError extends AppError {
  constructor(public readonly context?: ErrorContextType) {
    super(AppErrorCode.VALIDATOR_CUID_ERROR, context);
  }
}
