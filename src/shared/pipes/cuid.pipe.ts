import { Injectable } from "@nestjs/common";

import { AbstractValidatorPipe } from "./abstract.pipe";
import { ValidatorInvalidCuidError } from "../core/errors/app.error";
import { CuidValidator } from "../validators/cuid.validator";

@Injectable()
export class CuidPipe extends AbstractValidatorPipe<CuidValidator> {
  protected ErrorType = ValidatorInvalidCuidError;
  constructor(validator: CuidValidator) {
    super(validator);
  }
}
