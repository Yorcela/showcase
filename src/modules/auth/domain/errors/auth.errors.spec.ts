import { HttpStatus } from "@nestjs/common";

import { Dictionnary } from "@apptypes/dictionnary.type";

import {
  AuthLoginAccountBannedError,
  AuthLoginAccountDeletedError,
  AuthLoginAccountNotVerifiedError,
  AuthLoginAccountSuspendedError,
  AuthLoginInvalidCredentialError,
  AuthLoginUserNotFoundError,
} from "./login.error";
import {
  AuthPasswordHashingFailedError,
  AuthPasswordResetFailedError,
  AuthPasswordResetPasswordMismatchError,
  AuthPasswordResetTokenExpiredError,
  AuthPasswordResetTokenInvalidError,
} from "./password.error";
import {
  AuthRegisterEmailExistError,
  AuthRegisterEmailSendFailedError,
  PersistenceAuthRegisterFailedError,
  AuthRegisterVerificatioCodeInvalidnError,
  AuthRegisterVerificationAlreadyVerifiedError,
  AuthRegisterVerificationCodeExpiredError,
  AuthRegisterVerificationCodeInvalidOrExpiredError,
  AuthRegisterVerificationFailedError,
  AuthRegisterVerificationTokenInvalidError,
  AuthRegisterVerificationUserNotFoundError,
} from "./register.error";
import { AuthErrorCode, AuthErrorCodeValue, AuthErrorMessageMap } from "./registry.errors";

type AuthErrorStatic = {
  new (context?: Dictionnary & { error?: unknown }): {
    toJSON: () => {
      name: string;
      code: AuthErrorCodeValue;
      message: string;
      context: Dictionnary | null;
      httpStatus: number;
    };
    httpStatus: number;
  };
  toSwagger: () => {
    status: number;
    example: {
      code: AuthErrorCodeValue;
      message: string;
    };
  };
  name: string;
};

type ErrorScenario = {
  ErrorClass: AuthErrorStatic;
  code: AuthErrorCodeValue;
  status: HttpStatus;
};

const scenarios: ErrorScenario[] = [
  {
    ErrorClass: AuthRegisterEmailExistError,
    code: AuthErrorCode.REGISTRATION_EMAIL_EXISTS,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthRegisterEmailSendFailedError,
    code: AuthErrorCode.REGISTRATION_EMAIL_SEND_FAILED,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  {
    ErrorClass: PersistenceAuthRegisterFailedError,
    code: AuthErrorCode.REGISTRATION_FAILED,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  {
    ErrorClass: AuthRegisterVerificationUserNotFoundError,
    code: AuthErrorCode.REGISTRATION_USER_NOT_FOUND,
    status: HttpStatus.NOT_FOUND,
  },
  {
    ErrorClass: AuthRegisterVerificatioCodeInvalidnError,
    code: AuthErrorCode.VERIFICATION_CODE_INVALID,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthRegisterVerificationCodeExpiredError,
    code: AuthErrorCode.VERIFICATION_CODE_EXPIRED,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthRegisterVerificationCodeInvalidOrExpiredError,
    code: AuthErrorCode.VERIFICATION_CODE_INVALID_OR_EXPIRED,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthRegisterVerificationTokenInvalidError,
    code: AuthErrorCode.VERIFICATION_TOKEN_INVALID,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthRegisterVerificationFailedError,
    code: AuthErrorCode.VERIFICATION_FAILED,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  {
    ErrorClass: AuthRegisterVerificationAlreadyVerifiedError,
    code: AuthErrorCode.VERIFICATION_EMAIL_ALREADY_VERIFIED,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthLoginUserNotFoundError,
    code: AuthErrorCode.LOGIN_USER_NOT_FOUND,
    status: HttpStatus.NOT_FOUND,
  },
  {
    ErrorClass: AuthLoginInvalidCredentialError,
    code: AuthErrorCode.LOGIN_INVALID_CREDENTIALS,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthLoginAccountNotVerifiedError,
    code: AuthErrorCode.LOGIN_ACCOUNT_NOT_VERIFIED,
    status: HttpStatus.FORBIDDEN,
  },
  {
    ErrorClass: AuthLoginAccountSuspendedError,
    code: AuthErrorCode.LOGIN_ACCOUNT_SUSPENDED,
    status: HttpStatus.FORBIDDEN,
  },
  {
    ErrorClass: AuthLoginAccountBannedError,
    code: AuthErrorCode.LOGIN_ACCOUNT_BANNED,
    status: HttpStatus.FORBIDDEN,
  },
  {
    ErrorClass: AuthLoginAccountDeletedError,
    code: AuthErrorCode.LOGIN_ACCOUNT_SOFT_DELETED,
    status: HttpStatus.NOT_FOUND,
  },
  {
    ErrorClass: AuthPasswordResetTokenInvalidError,
    code: AuthErrorCode.PASSWORD_RESET_TOKEN_INVALID,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthPasswordResetTokenExpiredError,
    code: AuthErrorCode.PASSWORD_RESET_TOKEN_EXPIRED,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthPasswordResetPasswordMismatchError,
    code: AuthErrorCode.PASSWORD_RESET_PASSWORDS_MISMATCH,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthPasswordResetFailedError,
    code: AuthErrorCode.PASSWORD_RESET_FAILED,
    status: HttpStatus.BAD_REQUEST,
  },
  {
    ErrorClass: AuthPasswordHashingFailedError,
    code: AuthErrorCode.PASSWORD_HASHING_FAILED,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
];

describe("Auth domain errors", () => {
  describe.each(scenarios)("$ErrorClass.name", ({ ErrorClass, code, status }) => {
    it("should serialize to JSON with context information", () => {
      // Given
      const context = { detail: "value" };
      const error = new ErrorClass(context);

      // When
      const result = (error as any).toJSON();

      // Then
      const expectedMessage = AuthErrorMessageMap[code];
      const expected = {
        name: ErrorClass.name,
        code,
        message: expectedMessage,
        context,
        httpStatus: status,
      };
      expect(result).toEqual(expected);
    });

    it("should expose coherent swagger metadata", () => {
      // Given
      const expected = {
        status,
        example: {
          code,
          message: AuthErrorMessageMap[code],
        },
      };

      // When
      const result = ErrorClass.toSwagger();

      // Then
      expect(result).toEqual(expected);
    });
  });
});
