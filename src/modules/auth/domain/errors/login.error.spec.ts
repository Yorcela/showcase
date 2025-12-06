import { HttpStatus } from "@nestjs/common";

import {
  AuthLoginAccountBannedError,
  AuthLoginAccountDeletedError,
  AuthLoginAccountNotVerifiedError,
  AuthLoginAccountSuspendedError,
  AuthLoginInvalidCredentialError,
  AuthLoginUserNotFoundError,
  AuthRefreshTokenInvalidOrExpiredError,
  AuthRefreshTokenUserNotFoundError,
} from "./login.error";

describe("Auth login errors", () => {
  it.each([
    [AuthLoginUserNotFoundError, HttpStatus.NOT_FOUND],
    [AuthLoginInvalidCredentialError, HttpStatus.BAD_REQUEST],
    [AuthLoginAccountNotVerifiedError, HttpStatus.FORBIDDEN],
    [AuthLoginAccountSuspendedError, HttpStatus.FORBIDDEN],
    [AuthLoginAccountBannedError, HttpStatus.FORBIDDEN],
    [AuthLoginAccountDeletedError, HttpStatus.NOT_FOUND],
    [AuthRefreshTokenUserNotFoundError, HttpStatus.NOT_FOUND],
    [AuthRefreshTokenInvalidOrExpiredError, HttpStatus.BAD_REQUEST],
  ])("%p should expose correct status", (Ctor, expectedStatus) => {
    const error = new Ctor();
    expect(error.httpStatus).toBe(expectedStatus);
    expect(error.code).toBeDefined();
    expect(error.message).toBeTruthy();
  });

  it("should expose swagger example with code and message", () => {
    const swaggerDoc = AuthLoginInvalidCredentialError.toSwagger();

    expect(swaggerDoc.status).toBe(HttpStatus.BAD_REQUEST);
    expect(swaggerDoc.example).toMatchObject({
      code: expect.any(String),
      message: expect.any(String),
    });
  });
});
