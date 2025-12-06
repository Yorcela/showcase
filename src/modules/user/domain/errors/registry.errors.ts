import {
  ErrorCodeType,
  ErrorCodeName,
  ErrorCodeValue,
  ErrorMessageMap,
} from "@shared/core/abstract/error.abstract";

export type UsersErrorCodeName = ErrorCodeName<typeof UsersErrorCode>;
export type UsersErrorCodeValue = ErrorCodeValue<typeof UsersErrorCode>;

export const UsersErrorCode: ErrorCodeType = {
  USER_NOT_FOUND: "USR_ME_001",
} as const satisfies ErrorCodeType & Record<string, `USR_${string}`>;

export const UsersErrorMessageMap: ErrorMessageMap<UsersErrorCodeValue> = {
  [UsersErrorCode.USER_NOT_FOUND]: "User not found",
};
