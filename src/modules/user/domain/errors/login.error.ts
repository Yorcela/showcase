import { HttpStatus } from "@nestjs/common";

import { ErrorContextType } from "@shared/core/abstract/error.abstract";

import { AbstractUsersError } from "./abstract.error";
import { UsersErrorCode } from "./registry.errors";

export class UsersNotFoundError extends AbstractUsersError {
  constructor(public readonly context?: ErrorContextType) {
    super(UsersErrorCode.USER_NOT_FOUND, context, HttpStatus.NOT_FOUND);
  }
}
