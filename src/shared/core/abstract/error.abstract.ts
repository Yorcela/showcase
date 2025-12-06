import { HttpStatus, Logger } from "@nestjs/common";

import { Dictionnary } from "@apptypes/dictionnary.type";

export type ErrorCodeType = Record<string, string>;
export type ErrorCodeName<T extends ErrorCodeType> = keyof T;
export type ErrorCodeValue<T extends ErrorCodeType> = T[keyof T];
export type ErrorMessageMap<TCode extends string> = { [Code in TCode]: string };
export type ErrorContextType = Dictionnary & { error?: unknown };

export abstract class AbstractAppError<TCode extends string> extends Error {
  protected readonly logger = new Logger(this.constructor.name);
  constructor(
    public readonly messageMap: ErrorMessageMap<TCode>,
    public readonly code: TCode,
    public readonly ctx?: ErrorContextType,
    public readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(messageMap[code]);
    this.name = new.target.name;
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, new.target);
    }
    this.logger.error(`${code} (HttpStatus: ${httpStatus}): ${this.name} thrown. Context`, ctx);
  }

  /**
   * For TU purpose
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.ctx ?? null,
      httpStatus: this.httpStatus,
    };
  }

  static toSwagger<TError extends AbstractAppError<string>>(this: new () => TError) {
    const instance = new this();
    return {
      status: instance.httpStatus,
      example: {
        code: instance.code,
        message: instance.message,
      },
    };
  }
}
