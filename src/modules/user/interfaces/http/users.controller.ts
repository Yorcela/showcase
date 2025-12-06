import { Controller, HttpStatus, UseGuards, HttpCode, Get } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

import { CurrentUser } from "@modules/auth/application/decorators/current-user.decorator";
import { JwtPayload } from "@modules/auth/infrastructure/strategies/jwt.strategy";
import { JwtAuthGuard } from "@modules/auth/interfaces/guards/jwt-auth.guard";
import { MeSwagger } from "./swagger/me.swagger";
import { MeUseCase } from "../../application/usecases/me.usecase";
import { UserEntity } from "../../domain/entities/user.entity";
import { UsersGetMeSuccess } from "../../domain/success/password.success";
import { UsersMePayloadDto } from "../../presenters/dto/user.dto";

@MeSwagger.controller()
@Controller("users")
@UseGuards(JwtAuthGuard)
@UseGuards(ThrottlerGuard)
@Throttle({ users: {} })
export class UsersController {
  constructor(private readonly meUserCase: MeUseCase) {}

  // ================================
  // GET /users/me
  // ================================
  @MeSwagger.signature()
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getConnectedUserProfile(@CurrentUser() jwt: JwtPayload): Promise<UsersGetMeSuccess> {
    const userEntity: UserEntity = await this.meUserCase.getMe(jwt.sub);
    const response = new UsersGetMeSuccess(UsersMePayloadDto.fromEntity(userEntity));
    return response;
  }
}
