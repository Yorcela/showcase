import { AbstractAuthSuccess } from "./abstract.success";
import { AuthSuccessCode } from "./registry.success";
import {
  AuthRegisterPayloadDto,
  AuthVerifyEmailPayloadDto,
} from "../../interfaces/presenters/dto/register.dto";

// AuthRegisterSuccess
export type AuthRegisterPayloadType = AuthRegisterPayloadDto;
export class AuthRegisterSuccess extends AbstractAuthSuccess<AuthRegisterPayloadType> {
  constructor(payload: AuthRegisterPayloadType) {
    super(AuthSuccessCode.REGISTRATION_SUCCESSFUL, payload);
  }
}

// AuthRegisterEmailVerifiedSuccess
export type AuthRegisterEmailVerifiedSuccessPayloadType = AuthVerifyEmailPayloadDto;
export class AuthRegisterEmailVerifiedSuccess extends AbstractAuthSuccess<AuthRegisterEmailVerifiedSuccessPayloadType> {
  constructor(payload: AuthRegisterEmailVerifiedSuccessPayloadType) {
    super(AuthSuccessCode.REGISTRATION_EMAIL_VERIFIED, payload);
  }
}
