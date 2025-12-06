import { Injectable } from "@nestjs/common";

import { AbstractValidatorPipe } from "./abstract.pipe";
import { ValidatorInvalidHexTokenError } from "../core/errors/app.error";
import { HexTokenValidator } from "../validators/hex-token.validator";

@Injectable()
export class HexTokenPipe extends AbstractValidatorPipe<HexTokenValidator> {
  protected ErrorType = ValidatorInvalidHexTokenError;
  constructor(validator: HexTokenValidator) {
    super(validator);
  }
}
