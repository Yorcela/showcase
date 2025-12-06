import { ValidatorInvalidHexTokenError } from "../core/errors/app.error";
import { HexTokenValidator } from "../validators/hex-token.validator";

export type HashedToken = string & { readonly __brand: unique symbol };

export function asHashedToken(value: string): HashedToken {
  if (!HexTokenValidator._isValid(value)) throw new ValidatorInvalidHexTokenError({ value });
  return value as HashedToken;
}
