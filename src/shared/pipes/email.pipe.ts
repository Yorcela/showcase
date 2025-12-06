import { Injectable } from "@nestjs/common";

import { AbstractValidatorPipe } from "./abstract.pipe";
import { ValidatorInvalidEmailError } from "../core/errors/app.error";
import { EmailValidator } from "../validators/email.validator";

@Injectable()
export class EmailPipe extends AbstractValidatorPipe<EmailValidator> {
  protected ErrorType = ValidatorInvalidEmailError;
  constructor(validator: EmailValidator) {
    super(validator);
  }
}
