import { ValidatorInvalidJwtError } from "../core/errors/app.error";
import { JwtTokenValidator } from "../validators/jwt.validator";

export type JwtToken = string & { readonly __brand: unique symbol };

export function asJwtToken(value: string): JwtToken {
  if (!JwtTokenValidator._isValid(value)) throw new ValidatorInvalidJwtError({ value });
  return value as JwtToken;
}
