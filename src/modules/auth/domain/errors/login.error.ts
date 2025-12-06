import { HttpStatus } from "@nestjs/common";

import { ErrorContextType } from "@shared/core/abstract/error.abstract";

import { AbstractAuthError } from "./abstract.error";
import { AuthErrorCode } from "./registry.errors";

export class AuthLoginUserNotFoundError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.LOGIN_USER_NOT_FOUND, context, HttpStatus.NOT_FOUND);
  }
}
export class AuthLoginInvalidCredentialError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.LOGIN_INVALID_CREDENTIALS, context);
  }
}
export class AuthLoginAccountNotVerifiedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.LOGIN_ACCOUNT_NOT_VERIFIED, context, HttpStatus.FORBIDDEN);
  }
}
export class AuthLoginAccountSuspendedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.LOGIN_ACCOUNT_SUSPENDED, context, HttpStatus.FORBIDDEN);
  }
}
export class AuthLoginAccountBannedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.LOGIN_ACCOUNT_BANNED, context, HttpStatus.FORBIDDEN);
  }
}
export class AuthLoginAccountDeletedError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.LOGIN_ACCOUNT_SOFT_DELETED, context, HttpStatus.NOT_FOUND);
  }
}

export class AuthRefreshTokenUserNotFoundError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.REFRESH_TOKEN_USER_NOT_FOUND, context, HttpStatus.NOT_FOUND);
  }
}

export class AuthRefreshTokenInvalidOrExpiredError extends AbstractAuthError {
  constructor(public readonly context?: ErrorContextType) {
    super(AuthErrorCode.REFRESH_TOKEN_INVALID_OR_EXPIRED, context, HttpStatus.BAD_REQUEST);
  }
}
