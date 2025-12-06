import {
  SwaggerUserEmail,
  SwaggerUserAccessToken,
  SwaggerUserPassword,
  SwaggerUserRefreshToken,
  SwaggerUserId,
} from "@modules/user/presenters/swagger/user.decorator.swagger";

import { Cuid2 } from "@apptypes/cuid2.type";
import { JwtToken } from "@apptypes/jwt.type";
import { SecuredToken } from "@apptypes/secured-token.type";
import { AuthEntity } from "../../../domain/entities/auth.entity";
import { SwaggerUserLoginRememberMe } from "../swagger/login.decorator.swagger";

// ========== AuthConnect ==========
export class AuthorizeInputDto {
  @SwaggerUserId(true)
  userId!: Cuid2;
}

// ========== AuthLogin ==========
export class LoginInputDto {
  @SwaggerUserEmail(true)
  email!: string;
  @SwaggerUserPassword(true)
  password!: string;
  @SwaggerUserLoginRememberMe(false)
  rememberMe!: boolean;
}

export class AuthTokenPayloadDto {
  @SwaggerUserAccessToken(false)
  accessToken!: JwtToken;
  @SwaggerUserRefreshToken(false)
  refreshToken?: SecuredToken;
  constructor(params: { accessToken: JwtToken; refreshToken?: SecuredToken }) {
    Object.assign(this, params);
  }
  static of(params: { accessToken: JwtToken; refreshToken?: SecuredToken }) {
    return new AuthTokenPayloadDto(params);
  }

  static fromEntity(e: AuthEntity): AuthTokenPayloadDto {
    return new AuthTokenPayloadDto({
      accessToken: e.accessToken,
    });
  }
}
