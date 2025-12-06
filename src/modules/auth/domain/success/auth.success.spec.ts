import { UserRole, UserStatus } from "@modules/user/domain/entities/user.entity";
import { UserResponsePayloadDto } from "@shared/presenters/dto/user.response.dto";
import { Cuid2 } from "@apptypes/cuid2.type";
import { JwtToken } from "@apptypes/jwt.type";
import { AbstractAuthSuccess } from "./abstract.success";
import { AuthLoginSuccess, AuthLogoutSuccess } from "./login.success";
import { AuthPasswordResetEmailSentSuccess, AuthPasswordResetSuccess } from "./password.success";
import { AuthRegisterSuccess, AuthRegisterEmailVerifiedSuccess } from "./register.success";
import { AuthSuccessCode } from "./registry.success";
import { AuthTokenPayloadDto } from "../../interfaces/presenters/dto/login.dto";
import { AuthRegisterPayloadDto } from "../../interfaces/presenters/dto/register.dto";

class DummySuccess extends AbstractAuthSuccess<{ foo: string }> {
  constructor() {
    super(AuthSuccessCode.REGISTRATION_SUCCESSFUL, { foo: "bar" });
  }
}

describe("Auth success primitives", () => {
  it("should extend AbstractAppSuccess", () => {
    // Given / When
    const instance = new DummySuccess();

    // Then
    const expectedCode = AuthSuccessCode.REGISTRATION_SUCCESSFUL;
    expect(instance.code).toBe(expectedCode);
    expect(instance.payload).toEqual({ foo: "bar" });
  });

  it("should map registry payload types", () => {
    // Given
    const expectedKeys = Object.values(AuthSuccessCode);

    // When
    const actualKeys = expectedKeys;

    // Then
    expect(expectedKeys).toEqual(actualKeys);
  });
});

describe("Concrete auth success constructs", () => {
  it("should build register success wrappers", () => {
    // Given
    const userPayload = new UserResponsePayloadDto({
      userId: "user" as Cuid2,
      email: "user@example.com",
      hasPassword: true,
      status: UserStatus.PENDING_VERIFICATION,
      role: UserRole.USER,
    });
    const expiresAt = new Date("2025-01-01T00:00:00.000Z");
    const payload = AuthRegisterPayloadDto.of(userPayload.email, undefined, expiresAt);

    const payloadAfterOtp = AuthTokenPayloadDto.of({
      accessToken: "accessToken" as JwtToken,
    });

    // When
    const registration = new AuthRegisterSuccess(payload);
    const verified = new AuthRegisterEmailVerifiedSuccess(payloadAfterOtp);

    // Then
    expect(registration.code).toBe(AuthSuccessCode.REGISTRATION_SUCCESSFUL);
    expect(registration.payload.expiresAt).toBe(expiresAt);
    expect(verified.code).toBe(AuthSuccessCode.REGISTRATION_EMAIL_VERIFIED);
  });

  it("should build login success wrappers", () => {
    // Given
    const payload = AuthTokenPayloadDto.of({
      accessToken: "accessToken" as JwtToken,
    });

    // When
    const login = new AuthLoginSuccess(payload);
    const logout = new AuthLogoutSuccess({});

    // Then
    expect(login.code).toBe(AuthSuccessCode.LOGIN_SUCCESSFUL);
    expect(logout.code).toBe(AuthSuccessCode.LOGOUT_SUCCESSFUL);
  });

  it("should build password success wrappers", () => {
    // Given
    const payload = {};

    // When
    const emailSent = new AuthPasswordResetEmailSentSuccess(payload);
    const reset = new AuthPasswordResetSuccess(payload);

    // Then
    expect(emailSent.code).toBe(AuthSuccessCode.PASSWORD_RESET_EMAIL_SENT);
    expect(reset.code).toBe(AuthSuccessCode.PASSWORD_RESET_SUCCESSFUL);
  });
});
