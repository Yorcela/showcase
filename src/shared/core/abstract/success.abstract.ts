import { Dictionnary } from "@apptypes/dictionnary.type";

// GENERIC SUCCESS TYPES
export type SuccessCodeType = Record<string, string>;
export type SuccessCodeName<T extends SuccessCodeType> = keyof T;
export type SuccessCodeValue<T extends SuccessCodeType> = T[keyof T];
export type SuccessPayloadByCode<TCode extends string> = {
  [Code in TCode]: unknown;
};
export type SuccessPayloadBase = Dictionnary;

// ABSTRACT
export abstract class AbstractAppSuccess<TCode extends string, TPayload> {
  constructor(
    public readonly code: TCode,
    public readonly payload: TPayload,
  ) {}

  toJSON() {
    return { code: this.code, payload: this.payload };
  }
}
