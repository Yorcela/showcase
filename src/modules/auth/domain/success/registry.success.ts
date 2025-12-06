import {
  SuccessCodeName,
  SuccessCodeType,
  SuccessCodeValue,
  SuccessPayloadByCode,
} from "@shared/core/abstract/success.abstract";

import { AuthLoginPayloadType, AuthLogoutPayloadType } from "./login.success";
import {
  AuthPasswordResetEmailSentSuccess,
  AuthPasswordResetPayloadType,
} from "./password.success";
import {
  AuthRegisterEmailVerifiedSuccessPayloadType,
  AuthRegisterPayloadType,
} from "./register.success";

export type AuthSuccessCodeName = SuccessCodeName<typeof AuthSuccessCode>;
export type AuthSuccessCodeValue = SuccessCodeValue<typeof AuthSuccessCode>;

export const AuthSuccessCode = {
  // Registration success
  REGISTRATION_SUCCESSFUL: "AUTH_REG_S001",
  // Email verification success
  REGISTRATION_EMAIL_VERIFIED: "AUTH_VER_S001",
  // Password reset success
  PASSWORD_RESET_EMAIL_SENT: "AUTH_PWD_S001",
  PASSWORD_RESET_SUCCESSFUL: "AUTH_PWD_S002",
  // Login success
  LOGIN_SUCCESSFUL: "AUTH_LOG_S001",
  LOGOUT_SUCCESSFUL: "AUTH_LOG_S002",
} as const satisfies SuccessCodeType & Record<string, `AUTH_${string}`>;

export type AuthSuccessPayloadTypes = SuccessPayloadByCode<AuthSuccessCodeValue> & {
  // Registration
  [AuthSuccessCode.REGISTRATION_SUCCESSFUL]: AuthRegisterPayloadType;
  // Verification
  [AuthSuccessCode.REGISTRATION_EMAIL_VERIFIED]: AuthRegisterEmailVerifiedSuccessPayloadType;
  // Password reset
  [AuthSuccessCode.PASSWORD_RESET_EMAIL_SENT]: AuthPasswordResetEmailSentSuccess;
  [AuthSuccessCode.PASSWORD_RESET_SUCCESSFUL]: AuthPasswordResetPayloadType;
  // Login
  [AuthSuccessCode.LOGIN_SUCCESSFUL]: AuthLoginPayloadType;
  [AuthSuccessCode.LOGOUT_SUCCESSFUL]: AuthLogoutPayloadType;
};
