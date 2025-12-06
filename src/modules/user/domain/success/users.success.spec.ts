import { Cuid2 } from "@apptypes/cuid2.type";
import { UsersGetMeSuccess } from "./password.success";
import { UsersSuccessCode } from "./registry.success";
import { UsersMePayloadDto } from "../../presenters/dto/user.dto";
import { UserEntity, UserRole, UserStatus } from "../entities/user.entity";

describe("Users domain success", () => {
  it("should wrap payload and expose code", () => {
    const user = new UserEntity({
      id: "usr_1" as Cuid2,
      email: "john.doe@example.com",
      passwordHash: "hash",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const payload = UsersMePayloadDto.fromEntity(user);

    const success = new UsersGetMeSuccess(payload);

    expect(success.code).toBe(UsersSuccessCode.GETME_SUCCESSFUL);
    expect(success.payload).toEqual(payload);
  });
});
