import {
  SuccessCodeValue,
  SuccessPayloadBase,
  AbstractAppSuccess,
} from "@shared/core/abstract/success.abstract";

import { HealthSuccessCode } from "./registry.success";

export type AbstractHealthSuccessCodeValue = SuccessCodeValue<typeof HealthSuccessCode>;
export type AbstractHealthSuccessPayloadType = SuccessPayloadBase;

export abstract class AbstractHealthSuccess<TPayload> extends AbstractAppSuccess<
  AbstractHealthSuccessCodeValue,
  TPayload
> {}
