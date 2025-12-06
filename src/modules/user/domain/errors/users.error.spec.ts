import { HttpStatus } from "@nestjs/common";

import { UsersNotFoundError } from "./login.error";
import { UsersErrorCode, UsersErrorMessageMap } from "./registry.errors";

describe("Users domain errors", () => {
  it("should expose registry metadata", () => {
    expect(UsersErrorCode.USER_NOT_FOUND).toBe("USR_ME_001");
    expect(UsersErrorMessageMap[UsersErrorCode.USER_NOT_FOUND]).toBe("User not found");
  });

  it("should build UsersNotFoundError with http status", () => {
    const err = new UsersNotFoundError({ userId: "usr_1" });

    expect(err.code).toBe(UsersErrorCode.USER_NOT_FOUND);
    expect(err.httpStatus).toBe(HttpStatus.NOT_FOUND);
    expect(err.context).toEqual({ userId: "usr_1" });
    expect(err.toJSON()).toMatchObject({
      code: UsersErrorCode.USER_NOT_FOUND,
      message: "User not found",
    });
  });
});
