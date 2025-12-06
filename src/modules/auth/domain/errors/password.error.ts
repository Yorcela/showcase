import { HttpStatus } from "@nestjs/common";

import { ErrorContextType } from "@shared/core/abstract/error.abstract";

import { AbstractAuthError } from "./abstract.error";
import { AuthErrorCode } from "./registry.errors";

export class AuthPasswordResetTokenInvalidError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.PASSWORD_RESET_TOKEN_INVALID, context);
  }
}
export class AuthPasswordResetTokenExpiredError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.PASSWORD_RESET_TOKEN_EXPIRED, context);
  }
}
export class AuthPasswordResetPasswordMismatchError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.PASSWORD_RESET_PASSWORDS_MISMATCH, context);
  }
}
export class AuthPasswordResetFailedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.PASSWORD_RESET_FAILED, context);
  }
}
export class AuthPasswordHashingFailedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.PASSWORD_HASHING_FAILED, context, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
