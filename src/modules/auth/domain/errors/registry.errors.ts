import {
  ErrorCodeType,
  ErrorCodeName,
  ErrorCodeValue,
  ErrorMessageMap,
} from "@shared/core/abstract/error.abstract";

export type AuthErrorCodeName = ErrorCodeName<typeof AuthErrorCode>;
export type AuthErrorCodeValue = ErrorCodeValue<typeof AuthErrorCode>;

export const AuthErrorCode: ErrorCodeType = {
  // Registration errors
  REGISTRATION_EMAIL_EXISTS: "AUTH_REG_001",
  REGISTRATION_EMAIL_SEND_FAILED: "AUTH_REG_002",
  REGISTRATION_FAILED: "AUTH_REG_003",
  REGISTRATION_USER_NOT_FOUND: "AUTH_REG_004",

  // Email verification errors
  VERIFICATION_CODE_INVALID: "AUTH_VER_001",
  VERIFICATION_CODE_EXPIRED: "AUTH_VER_002",
  VERIFICATION_CODE_INVALID_OR_EXPIRED: "AUTH_VER_001-2",
  VERIFICATION_TOKEN_INVALID: "AUTH_VER_003",
  VERIFICATION_FAILED: "AUTH_VER_004",
  VERIFICATION_EMAIL_ALREADY_VERIFIED: "AUTH_VER_005",
  VERIFICATION_EMAIL_NOT_PENDING: "AUTH_VER_006",

  // Login errors
  LOGIN_USER_NOT_FOUND: "AUTH_LOG_000",
  LOGIN_INVALID_CREDENTIALS: "AUTH_LOG_001",
  LOGIN_ACCOUNT_NOT_VERIFIED: "AUTH_LOG_002",
  LOGIN_ACCOUNT_SUSPENDED: "AUTH_LOG_003",
  LOGIN_ACCOUNT_BANNED: "AUTH_LOG_004",
  LOGIN_ACCOUNT_SOFT_DELETED: "AUTH_LOG_005",

  // Refresh tokens
  REFRESH_TOKEN_INVALID_OR_EXPIRED: "AUTH_RT_001",
  REFRESH_TOKEN_USER_NOT_FOUND: "AUTH_RT_002",

  // Password reset errors
  PASSWORD_RESET_TOKEN_INVALID: "AUTH_PWD_001",
  PASSWORD_RESET_TOKEN_EXPIRED: "AUTH_PWD_002",
  PASSWORD_RESET_PASSWORDS_MISMATCH: "AUTH_PWD_003",
  PASSWORD_RESET_FAILED: "AUTH_PWD_004",
  PASSWORD_HASHING_FAILED: "AUTH_PWD_005",

  // General auth errors
  AUTH_PERSISTENCE_FAILURE: "AUTH_DB_001",
  AUTH_NOT_IMPLEMENTED: "AUTH_GEN_001",
} as const satisfies ErrorCodeType & Record<string, `AUTH_${string}`>;

export const AuthErrorMessageMap: ErrorMessageMap<AuthErrorCodeValue> = {
  // Registration
  [AuthErrorCode.REGISTRATION_EMAIL_EXISTS]: "An account with this email address already exists",
  [AuthErrorCode.REGISTRATION_EMAIL_SEND_FAILED]: "Email could not be sent",
  [AuthErrorCode.REGISTRATION_FAILED]: "Registration failed due to an internal error",
  [AuthErrorCode.REGISTRATION_USER_NOT_FOUND]: "User not found",

  // Verification
  [AuthErrorCode.VERIFICATION_CODE_INVALID]: "Invalid verification code provided",
  [AuthErrorCode.VERIFICATION_CODE_EXPIRED]: "Verification code has expired",
  [AuthErrorCode.VERIFICATION_CODE_INVALID_OR_EXPIRED]: "Verification code invalid or expired",
  [AuthErrorCode.VERIFICATION_TOKEN_INVALID]: "Invalid or expired verification link",
  [AuthErrorCode.VERIFICATION_FAILED]: "Email verification failed due to an internal error",
  [AuthErrorCode.VERIFICATION_EMAIL_ALREADY_VERIFIED]: "Email address is already verified",
  [AuthErrorCode.VERIFICATION_EMAIL_NOT_PENDING]: "User is not pending verification",

  // Login
  [AuthErrorCode.LOGIN_USER_NOT_FOUND]: "User not found",
  [AuthErrorCode.LOGIN_INVALID_CREDENTIALS]: "Invalid email or password",
  [AuthErrorCode.LOGIN_ACCOUNT_NOT_VERIFIED]: "Please verify your email address before logging in",
  [AuthErrorCode.LOGIN_ACCOUNT_SUSPENDED]: "Account has been suspended",
  [AuthErrorCode.LOGIN_ACCOUNT_BANNED]: "Account is banned",
  [AuthErrorCode.LOGIN_ACCOUNT_SOFT_DELETED]: "Account has been deleted",

  // Refresh token
  [AuthErrorCode.REFRESH_TOKEN_INVALID_OR_EXPIRED]: "Invalid or expired refresh token",
  [AuthErrorCode.REFRESH_TOKEN_USER_NOT_FOUND]: "User not found when trying to refresh token",

  // Password reset
  [AuthErrorCode.PASSWORD_RESET_TOKEN_INVALID]: "Password reset token is invalid",
  [AuthErrorCode.PASSWORD_RESET_TOKEN_EXPIRED]: "Password reset token has expired",
  [AuthErrorCode.PASSWORD_RESET_PASSWORDS_MISMATCH]: "Provided passwords do not match",
  [AuthErrorCode.PASSWORD_RESET_FAILED]: "Password reset failed due to an internal error",
  [AuthErrorCode.PASSWORD_HASHING_FAILED]: "Password hashing failed due to an internal error",

  // General
  [AuthErrorCode.AUTH_PERSISTENCE_FAILURE]: "Could not persist data.",
  [AuthErrorCode.AUTH_NOT_IMPLEMENTED]: "This authentication feature is not yet implemented",
};
