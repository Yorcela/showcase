import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

import { ValidatorAbstract, ValidatorResult } from "../validators/abstract.validator";

@Injectable()
export abstract class AbstractValidatorPipe<TValidator extends ValidatorAbstract<any>>
  implements PipeTransform
{
  protected abstract ErrorType: new (payload: any) => Error;

  constructor(protected readonly validator: TValidator) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (value && (typeof value === "object" || Array.isArray(value))) {
      const errors = this.validator.validateInObject(value as Record<string, any>);
      if (errors.length > 0) {
        const message = errors
          .map((e: ValidatorResult) => e.reason)
          .filter(Boolean)
          .join("; ");
        throw new this.ErrorType({ value, message, errors });
      }
    }
    return value;
  }
}
