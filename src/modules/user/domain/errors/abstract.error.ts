import { HttpStatus } from "@nestjs/common";

import { AbstractAppError, ErrorContextType } from "@shared/core/abstract/error.abstract";
import { UsersErrorCodeValue, UsersErrorMessageMap } from "./registry.errors";

export abstract class AbstractUsersError extends AbstractAppError<UsersErrorCodeValue> {
  protected constructor(
    code: UsersErrorCodeValue,
    context?: ErrorContextType,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(UsersErrorMessageMap, code, context, httpStatus);
  }
}
