import { HttpStatus } from "@nestjs/common";

import {
  AppError,
  ValidatorInvalidEmailError,
  ValidatorInvalidJwtError,
  ValidatorInvalidHexTokenError,
  ValidatorInvalidCuidError,
} from "./app.error";
import { AppErrorCode, AppErrorMessageMap } from "./registry.error";

class CustomError extends AppError {
  constructor() {
    super(AppErrorCode.DATABASE_ERROR, { db: "primary" }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

describe("AppError", () => {
  it("should serialize base exception with context", () => {
    // Given / When
    const exception = new CustomError();
    const json = (exception as any).toJSON();

    // Then
    expect(json).toMatchObject({
      code: AppErrorCode.DATABASE_ERROR,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      context: { db: "primary" },
    });
    expect(exception.message).toContain(AppErrorMessageMap[AppErrorCode.DATABASE_ERROR]);
  });

  it("should map validator exceptions", () => {
    // Given
    const cases = [
      new ValidatorInvalidEmailError(),
      new ValidatorInvalidJwtError({ token: "abc" }),
      new ValidatorInvalidHexTokenError(),
      new ValidatorInvalidCuidError(),
    ];

    // When / Then
    expect(cases[0].code).toBe(AppErrorCode.VALIDATOR_EMAIL_ERROR);
    expect(cases[1].code).toBe(AppErrorCode.VALIDATOR_JWT_ERROR);
    expect(cases[1].context).toEqual({ token: "abc" });
    expect(cases[2].code).toBe(AppErrorCode.VALIDATOR_HEXTOKEN_ERROR);
    expect(cases[3].code).toBe(AppErrorCode.VALIDATOR_CUID_ERROR);
  });
});
