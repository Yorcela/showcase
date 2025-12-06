import { ValidatorInvalidCuidError } from "../core/errors/app.error";
import { CuidValidator } from "../validators/cuid.validator";

export type Cuid2 = string & { readonly __brand: unique symbol };

export function asCuid2(value: string): Cuid2 {
  if (!CuidValidator._isValid(value)) throw new ValidatorInvalidCuidError({ value });
  return value as Cuid2;
}
