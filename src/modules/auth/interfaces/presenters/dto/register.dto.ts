import { ApiPropertyOptional } from "@nestjs/swagger";

import {
  SwaggerUserEmail,
  SwaggerUserOtpCode,
  SwaggerUserVerificationToken,
} from "@modules/user/presenters/swagger/user.decorator.swagger";

import { SecuredToken } from "@apptypes/secured-token.type";
import { AuthTokenPayloadDto } from "./login.dto";

// ========== AuthRegister ==========
export class AuthRegisterInputDto {
  @SwaggerUserEmail(true)
  email: string = "";
}

export class AuthRegisterPayloadDto {
  @SwaggerUserEmail()
  email!: string;
  @SwaggerUserVerificationToken()
  verificationToken?: SecuredToken;
  @ApiPropertyOptional({ type: String, format: "date-time" })
  expiresAt?: Date;

  constructor(email: string, verificationToken?: SecuredToken | null, expiresAt?: Date | null) {
    this.email = email;
    if (verificationToken) this.verificationToken = verificationToken;
    if (expiresAt) this.expiresAt = expiresAt;
  }

  static of(email: string, verificationToken?: SecuredToken | null, expiresAt?: Date | null) {
    return new AuthRegisterPayloadDto(
      email,
      verificationToken ?? undefined,
      expiresAt ?? undefined,
    );
  }
}

// ========== AuthVerifyEmail ==========
export class AuthVerifyEmailInputDto {
  @SwaggerUserEmail(true)
  email!: string;
  @SwaggerUserOtpCode(true)
  code!: string;
  @SwaggerUserVerificationToken(true)
  verificationToken!: string;
}

export class AuthVerifyEmailPayloadDto extends AuthTokenPayloadDto {}
