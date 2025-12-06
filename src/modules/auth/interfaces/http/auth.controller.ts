import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { Response } from "express";

import {
  buildClearRefreshCookieOptions,
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
} from "@infrastructure/http/cookies/cookie.config";
import { Cookie } from "@shared/core/decorators/cookie.decorator";
import { AppConfig } from "@shared/modules/config/app.config";
import { SecuredToken } from "@apptypes/secured-token.type";
import { AuthLoginSwagger, AuthLogoutSwagger, AuthRefreshSwagger } from "./swagger/auth.swagger";
import { AuthUseCase } from "../../application/usecases/auth.usecase";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { AuthLoginSuccess, AuthLogoutSuccess } from "../../domain/success/login.success";
import { LoginInputDto, AuthTokenPayloadDto } from "../presenters/dto/login.dto";

@AuthLoginSwagger.controller()
@Controller("auth")
@UseGuards(ThrottlerGuard)
@Throttle({ auth: {} })
export class AuthController {
  constructor(
    private readonly authUseCases: AuthUseCase,
    private readonly appConfig: AppConfig,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @AuthLoginSwagger.signature()
  async login(
    @Body() input: LoginInputDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthLoginSuccess> {
    const authEntity: AuthEntity = await this.authUseCases.login(input);
    this.setRefreshCookie(res, authEntity);
    return new AuthLoginSuccess(AuthTokenPayloadDto.of({ accessToken: authEntity.accessToken }));
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @AuthRefreshSwagger.signature()
  async refresh(
    @Cookie(REFRESH_COOKIE_NAME) refreshToken: SecuredToken,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthLoginSuccess> {
    const { authEntity, rotated } = await this.authUseCases.refreshFromToken(refreshToken);
    if (rotated) this.setRefreshCookie(res, authEntity);
    return new AuthLoginSuccess(AuthTokenPayloadDto.of({ accessToken: authEntity.accessToken }));
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @AuthLogoutSwagger.signature()
  async logout(
    @Cookie(REFRESH_COOKIE_NAME) refreshToken: SecuredToken,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthLogoutSuccess> {
    await this.authUseCases.logout(refreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, buildClearRefreshCookieOptions(this.appConfig));
    return new AuthLogoutSuccess({});
  }

  private setRefreshCookie(res: Response, authEntity: AuthEntity): void {
    setRefreshTokenCookie(
      res,
      this.appConfig,
      authEntity.refreshToken,
      authEntity.refreshTokenExpiresAt,
    );
  }
}
