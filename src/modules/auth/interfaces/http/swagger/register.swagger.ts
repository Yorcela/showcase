import { HttpStatus } from "@nestjs/common";

import { createEndpointSwagger } from "@shared/interfaces/http/swagger/endpoint.swagger";
import {
  AuthPersistenceFailureError,
  AuthRegisterEmailSendFailedError,
  AuthRegisterVerificationAlreadyVerifiedError,
  AuthRegisterVerificatioCodeInvalidnError,
  AuthRegisterVerificationCodeInvalidOrExpiredError,
  AuthRegisterVerificationTokenInvalidError,
  AuthRegisterEmailExistError,
} from "../../../domain/errors/register.error";

import {
  AuthRegisterInputDto,
  AuthRegisterPayloadDto,
  AuthVerifyEmailInputDto,
  AuthVerifyEmailPayloadDto,
} from "../../presenters/dto/register.dto";

export const RegistrationSwagger = createEndpointSwagger({
  tag: "register",
  summary: "Register by email",
  description: "Registers email and sends a verification OTP.",
  body: AuthRegisterInputDto,
  response: AuthRegisterPayloadDto,
  defaultStatus: HttpStatus.CREATED,
  errors: [
    AuthRegisterEmailExistError.toSwagger(),
    AuthRegisterVerificationAlreadyVerifiedError.toSwagger(),
    AuthPersistenceFailureError.toSwagger(),
    AuthRegisterEmailSendFailedError.toSwagger(),
  ],
});

export const RegisterVerifySwagger = createEndpointSwagger({
  tag: "register",
  summary: "Verify email",
  description: "Verifies email through OTP and token.",
  body: AuthVerifyEmailInputDto,
  response: AuthVerifyEmailPayloadDto,
  defaultStatus: HttpStatus.OK,
  errors: [
    AuthRegisterVerificationCodeInvalidOrExpiredError.toSwagger(),
    AuthRegisterVerificationTokenInvalidError.toSwagger(),
    AuthRegisterVerificatioCodeInvalidnError.toSwagger(),
    AuthPersistenceFailureError.toSwagger(),
  ],
});
