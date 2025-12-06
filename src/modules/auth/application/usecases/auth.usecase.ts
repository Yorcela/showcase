import { Inject, Injectable } from "@nestjs/common";

import {
  UNIT_OF_WORK_PORT,
  UnitOfWorkPort,
  UowContext,
} from "@ports/unit-of-work/unit-of-work.port";

import { UserService } from "@modules/user/application/services/user.service";
import { Cuid2 } from "@apptypes/cuid2.type";
import { SecuredToken } from "@apptypes/secured-token.type";
import { AuthEntity } from "../../domain/entities/auth.entity";

import { AuthRefreshTokenInvalidOrExpiredError } from "../../domain/errors/login.error";
import { LoginInputDto } from "../../interfaces/presenters/dto/login.dto";
import { AuthTokenService } from "../services/auth-tokens.service";

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject(UNIT_OF_WORK_PORT) private readonly uow: UnitOfWorkPort,
    private readonly authTokenService: AuthTokenService,
    private readonly userService: UserService,
  ) {}

  async login(input: LoginInputDto): Promise<AuthEntity> {
    return this.uow.runInTransaction(async (ctx: UowContext) => {
      const userId: Cuid2 = await this.userService.checkCredentials(
        input.email,
        input.password,
        ctx,
      );
      return await this.createAuthTokenForUser(userId, input.rememberMe);
    });
  }

  async createAuthTokenForUser(userId: Cuid2, remember: boolean = false): Promise<AuthEntity> {
    return this.uow.runInTransaction(async (ctx: UowContext) => {
      return await this.authTokenService.createUserToken({ userId, remember }, ctx);
    });
  }

  async refreshFromToken(
    refreshToken: SecuredToken,
  ): Promise<{ authEntity: AuthEntity; rotated: boolean }> {
    return this.uow.runInTransaction(async (ctx: UowContext) => {
      const result = await this.authTokenService.refreshTokens(refreshToken, ctx);
      if (!result) throw new AuthRefreshTokenInvalidOrExpiredError();
      return result;
    });
  }

  async logout(refreshToken: SecuredToken): Promise<void> {
    return this.uow.runInTransaction(async (ctx: UowContext) => {
      await this.authTokenService.logout(refreshToken, ctx);
    });
  }
}
