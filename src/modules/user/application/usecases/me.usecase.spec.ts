import { UnitOfWorkPort, UowContext } from "@ports/unit-of-work/unit-of-work.port";

import { Cuid2 } from "@apptypes/cuid2.type";
import { MeUseCase } from "./me.usecase";
import { UserEntity, UserRole, UserStatus } from "../../domain/entities/user.entity";
import { UsersNotFoundError } from "../../domain/errors/login.error";
import { UserService } from "../services/user.service";

describe("MeUseCase", () => {
  const createFixture = () => {
    const userService = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    const ctx: UowContext = { tx: Symbol("tx") };
    const uow: jest.Mocked<UnitOfWorkPort> = {
      runInTransaction: jest.fn(async (fn) => fn(ctx)),
    } as unknown as jest.Mocked<UnitOfWorkPort>;

    const useCase = new MeUseCase(uow, userService);

    return { useCase, userService, uow, ctx };
  };

  it("should return current user when found", async () => {
    const { useCase, userService, uow, ctx } = createFixture();
    const user = new UserEntity({
      id: "usr_1" as Cuid2,
      email: "john.doe@example.com",
      passwordHash: "hash",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userService.getById = jest.fn().mockResolvedValue(user);

    const result = await useCase.getMe(user.id);

    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
    expect(userService.getById).toHaveBeenCalledWith(user.id, ctx);
    expect(result).toBe(user);
  });

  it("should throw UsersNotFoundError when user missing", async () => {
    const { useCase, userService, ctx, uow } = createFixture();
    const userId = "usr_missing" as Cuid2;
    userService.getById = jest.fn().mockResolvedValue(null);

    const action = useCase.getMe(userId);

    await expect(action).rejects.toBeInstanceOf(UsersNotFoundError);
    expect(uow.runInTransaction).toHaveBeenCalledTimes(1);
    expect(userService.getById).toHaveBeenCalledWith(userId, ctx);
  });
});
