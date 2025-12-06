import { ValidatorInvalidHexTokenError } from "../core/errors/app.error";
import { HexTokenValidator } from "../validators/hex-token.validator";

export type SecuredToken = string & { readonly __brand: unique symbol };

export function asSecuredToken(value: string): SecuredToken {
  if (!HexTokenValidator._isValid(value)) throw new ValidatorInvalidHexTokenError({ value });
  return value as SecuredToken;
}
