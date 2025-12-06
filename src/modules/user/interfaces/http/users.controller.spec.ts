import { Cuid2 } from "@apptypes/cuid2.type";
import { UsersController } from "./users.controller";
import { MeUseCase } from "../../application/usecases/me.usecase";
import { UserEntity, UserRole, UserStatus } from "../../domain/entities/user.entity";
import { UsersGetMeSuccess } from "../../domain/success/password.success";
import { UsersMePayloadDto } from "../../presenters/dto/user.dto";

describe("UsersController", () => {
  let controller: UsersController;
  let meUseCase: jest.Mocked<MeUseCase>;

  beforeEach(() => {
    meUseCase = {
      getMe: jest.fn(),
    } as unknown as jest.Mocked<MeUseCase>;

    controller = new UsersController(meUseCase);
  });

  it("should return current user profile", async () => {
    const user = new UserEntity({
      id: "usr_123" as Cuid2,
      email: "john@example.com",
      passwordHash: "hash",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    meUseCase.getMe.mockResolvedValue(user);
    const jwt = { sub: user.id } as any;

    const result = await controller.getConnectedUserProfile(jwt);

    expect(meUseCase.getMe).toHaveBeenCalledWith(user.id);
    expect(result).toBeInstanceOf(UsersGetMeSuccess);
    expect(result.payload).toEqual(UsersMePayloadDto.fromEntity(user));
  });
});
