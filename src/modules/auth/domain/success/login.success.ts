import { SuccessPayloadBase } from "@shared/core/abstract/success.abstract";

import { AbstractAuthSuccess } from "./abstract.success";
import { AuthSuccessCode } from "./registry.success";
import { AuthTokenPayloadDto } from "../../interfaces/presenters/dto/login.dto";

// AuthLoginSuccess
export type AuthLoginPayloadType = AuthTokenPayloadDto;
export class AuthLoginSuccess extends AbstractAuthSuccess<AuthLoginPayloadType> {
  constructor(payload: AuthLoginPayloadType) {
    super(AuthSuccessCode.LOGIN_SUCCESSFUL, payload);
  }
}

// AuthLogoutPayloadType
export type AuthLogoutPayloadType = SuccessPayloadBase;
export class AuthLogoutSuccess extends AbstractAuthSuccess<AuthLogoutPayloadType> {
  constructor(payload: AuthLogoutPayloadType) {
    super(AuthSuccessCode.LOGOUT_SUCCESSFUL, payload);
  }
}
