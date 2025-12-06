import { Module } from "@nestjs/common";

import { UserService } from "./application/services/user.service";
import { MeUseCase } from "./application/usecases/me.usecase";
import { UsersController } from "./interfaces/http/users.controller";

@Module({
  controllers: [UsersController],
  providers: [
    // USE CASES
    MeUseCase,
    // SERVICES
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
