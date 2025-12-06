import { Inject, Injectable } from "@nestjs/common";

import {
  UNIT_OF_WORK_PORT,
  UnitOfWorkPort,
  UowContext,
} from "@ports/unit-of-work/unit-of-work.port";

import { Cuid2 } from "@apptypes/cuid2.type";
import { UserEntity } from "../../domain/entities/user.entity";
import { UsersNotFoundError } from "../../domain/errors/login.error";
import { UserService } from "../services/user.service";

@Injectable()
export class MeUseCase {
  constructor(
    @Inject(UNIT_OF_WORK_PORT) private readonly uow: UnitOfWorkPort,
    private readonly userService: UserService,
  ) {}

  async getMe(userId: Cuid2): Promise<UserEntity> {
    return this.uow.runInTransaction(async (ctx: UowContext) => {
      const user: UserEntity | null = await this.userService.getById(userId, ctx);
      if (!user) throw new UsersNotFoundError({ userId });
      return user;
    });
  }
}
