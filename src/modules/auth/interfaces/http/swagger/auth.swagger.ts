import { createEndpointSwagger } from "@shared/interfaces/http/swagger/endpoint.swagger";
import { AuthRefreshTokenInvalidOrExpiredError } from "../../../domain/errors/login.error";
import { LoginInputDto, AuthTokenPayloadDto } from "../../presenters/dto/login.dto";

export const AuthLoginSwagger = createEndpointSwagger({
  tag: "login",
  summary: "Login",
  description: "Login the user.",
  body: LoginInputDto,
  response: AuthTokenPayloadDto,
  errors: [AuthRefreshTokenInvalidOrExpiredError.toSwagger()],
});

export const AuthRefreshSwagger = createEndpointSwagger({
  tag: "refresh token",
  summary: "Refresh Access Token",
  description:
    "Reads the HttpOnly refresh token cookie and returns a new access token. No body is required; send only the cookie.",
  response: AuthTokenPayloadDto,
  needsCookieAuth: true,
  errors: [AuthRefreshTokenInvalidOrExpiredError.toSwagger()],
});

export const AuthLogoutSwagger = createEndpointSwagger({
  tag: "logout",
  summary: "Logout",
  description:
    "Clears the refresh-token cookie and revokes the active session. No body is required; only the cookie is read.",
  response: AuthTokenPayloadDto,
  needsCookieAuth: true,
  errors: [AuthRefreshTokenInvalidOrExpiredError.toSwagger()],
});
