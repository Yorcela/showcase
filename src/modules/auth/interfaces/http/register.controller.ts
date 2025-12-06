import { Controller, Post, Body, HttpStatus, UseGuards, HttpCode, Res } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { Response } from "express";

import { setRefreshTokenCookie } from "@infrastructure/http/cookies/cookie.config";
import { AppConfig } from "@shared/modules/config/app.config";
import { RegisterVerifySwagger, RegistrationSwagger } from "./swagger/register.swagger";
import { AuthUseCase } from "../../application/usecases/auth.usecase";
import { RegistrationUseCase } from "../../application/usecases/register.usecase";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { EmailVerificationEntity } from "../../domain/entities/email-verification.entity";
import {
  AuthRegisterEmailVerifiedSuccess,
  AuthRegisterSuccess,
} from "../../domain/success/register.success";
import {
  AuthRegisterInputDto,
  AuthRegisterPayloadDto,
  AuthVerifyEmailInputDto,
  AuthVerifyEmailPayloadDto,
} from "../presenters/dto/register.dto";

@RegistrationSwagger.controller()
@Controller("auth")
@UseGuards(ThrottlerGuard)
@Throttle({ auth: {} })
export class RegistrationController {
  constructor(
    private readonly registerUseCases: RegistrationUseCase,
    private readonly authUseCases: AuthUseCase,
    private readonly appConfig: AppConfig,
  ) {}

  // ================================
  // ✍️ REGISTER
  // ================================
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @RegistrationSwagger.signature()
  async registerEmail(@Body() input: AuthRegisterInputDto): Promise<AuthRegisterSuccess> {
    const { email, verificationToken, expiresAt } =
      await this.registerUseCases.registerEmail(input);
    const response = new AuthRegisterSuccess(
      AuthRegisterPayloadDto.of(email, verificationToken, expiresAt),
    );
    return response;
  }

  @Post("register/verify")
  @HttpCode(HttpStatus.OK)
  @RegisterVerifySwagger.signature()
  async verifyEmail(
    @Body() input: AuthVerifyEmailInputDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthRegisterEmailVerifiedSuccess> {
    const emailVerifEntity: EmailVerificationEntity =
      await this.registerUseCases.verifyEmail(input);
    const authEntity: AuthEntity = await this.authUseCases.createAuthTokenForUser(
      emailVerifEntity.userId,
    );
    this.setRefreshCookie(res, authEntity);
    return new AuthRegisterEmailVerifiedSuccess(
      AuthVerifyEmailPayloadDto.of({ accessToken: authEntity.accessToken }),
    );
  }

  // ================================
  // utils
  // ================================
  private setRefreshCookie(res: Response, authEntity: AuthEntity): void {
    setRefreshTokenCookie(
      res,
      this.appConfig,
      authEntity.refreshToken,
      authEntity.refreshTokenExpiresAt,
    );
  }
}
