import { SuccessPayloadBase } from "@shared/core/abstract/success.abstract";

import { AbstractAuthSuccess } from "./abstract.success";
import { AuthSuccessCode } from "./registry.success";

// AuthPasswordResetEmailSentSuccess
export type AuthPasswordResetEmailSentSuccessPayloadType = SuccessPayloadBase;
export class AuthPasswordResetEmailSentSuccess extends AbstractAuthSuccess<AuthPasswordResetEmailSentSuccessPayloadType> {
  constructor(payload: AuthPasswordResetEmailSentSuccessPayloadType) {
    super(AuthSuccessCode.PASSWORD_RESET_EMAIL_SENT, payload);
  }
}

// AuthPasswordResetSuccess
export type AuthPasswordResetPayloadType = SuccessPayloadBase;
export class AuthPasswordResetSuccess extends AbstractAuthSuccess<AuthPasswordResetPayloadType> {
  constructor(payload: AuthPasswordResetPayloadType) {
    super(AuthSuccessCode.PASSWORD_RESET_SUCCESSFUL, payload);
  }
}
