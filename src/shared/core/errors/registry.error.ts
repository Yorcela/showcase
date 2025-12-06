import {
  ErrorCodeName,
  ErrorCodeType,
  ErrorCodeValue,
  ErrorMessageMap,
} from "../abstract/error.abstract";

export type AppErrorCodeName = ErrorCodeName<typeof AppErrorCode>;
export type AppErrorCodeValue = ErrorCodeValue<typeof AppErrorCode>;

export const AppErrorCode: ErrorCodeType = {
  // Database Error
  DATABASE_ERROR: "DB_001",
  // Validator Error
  VALIDATOR_JWT_ERROR: "VAL_JWT_001",
  VALIDATOR_HEXTOKEN_ERROR: "VAL_JWT_001",
  VALIDATOR_CUID_ERROR: "VAL_CUID_001",
  VALIDATOR_EMAIL_ERROR: "VAL_EMAIL_001",
};

export const AppErrorMessageMap: ErrorMessageMap<AppErrorCodeValue> = {
  [AppErrorCode.DATABASE_ERROR]: "Error trying to connect to database",
  [AppErrorCode.VALIDATOR_JWT_ERROR]: "Invalid JWT token",
  [AppErrorCode.VALIDATOR_HEXTOKEN_ERROR]: "Invalid hexadecimal token",
  [AppErrorCode.VALIDATOR_CUID_ERROR]: "Invalid CUID",
  [AppErrorCode.VALIDATOR_EMAIL_ERROR]: "Invalid email format",
};
