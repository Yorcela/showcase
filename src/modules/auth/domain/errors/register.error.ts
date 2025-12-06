import { HttpStatus } from "@nestjs/common";

import { ErrorContextType } from "@shared/core/abstract/error.abstract";

import { AbstractAuthError } from "./abstract.error";
import { AuthErrorCode } from "./registry.errors";

export class AuthPersistenceFailureError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.AUTH_PERSISTENCE_FAILURE, context, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
export class PersistenceAuthRegisterFailedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.REGISTRATION_FAILED, context, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
export class AuthRegisterEmailExistError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.REGISTRATION_EMAIL_EXISTS, context);
  }
}
export class AuthRegisterEmailSendFailedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.REGISTRATION_EMAIL_SEND_FAILED, context, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
export class AuthRegisterVerificationUserNotFoundError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.REGISTRATION_USER_NOT_FOUND, context, HttpStatus.NOT_FOUND);
  }
}
export class AuthRegisterVerificatioCodeInvalidnError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.VERIFICATION_CODE_INVALID, context);
  }
}
export class AuthRegisterVerificationCodeExpiredError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.VERIFICATION_CODE_EXPIRED, context);
  }
}
export class AuthRegisterVerificationCodeInvalidOrExpiredError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.VERIFICATION_CODE_INVALID_OR_EXPIRED, context);
  }
}
export class AuthRegisterVerificationTokenInvalidError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.VERIFICATION_TOKEN_INVALID, context);
  }
}
export class AuthRegisterVerificationFailedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.VERIFICATION_FAILED, context, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
export class AuthRegisterVerificationAlreadyVerifiedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.VERIFICATION_EMAIL_ALREADY_VERIFIED, context);
  }
}
export class AuthRegisterVerificationNotPendingVerificationError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.VERIFICATION_EMAIL_NOT_PENDING, context);
  }
}
