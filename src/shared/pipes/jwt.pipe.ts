import { Injectable } from "@nestjs/common";

import { AbstractValidatorPipe } from "./abstract.pipe";
import { ValidatorInvalidJwtError } from "../core/errors/app.error";
import { JwtTokenValidator } from "../validators/jwt.validator";

@Injectable()
export class JwtPipe extends AbstractValidatorPipe<JwtTokenValidator> {
  protected ErrorType = ValidatorInvalidJwtError;
  constructor(validator: JwtTokenValidator) {
    super(validator);
  }
}
