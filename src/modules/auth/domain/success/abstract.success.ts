import {
  SuccessCodeValue,
  SuccessPayloadBase,
  AbstractAppSuccess,
} from "@shared/core/abstract/success.abstract";

import { AuthSuccessCode } from "./registry.success";

export type AbstractAuthSuccessCodeValue = SuccessCodeValue<typeof AuthSuccessCode>;
export type AbstractAuthSuccessPayloadType = SuccessPayloadBase;

export abstract class AbstractAuthSuccess<TPayload> extends AbstractAppSuccess<
  AbstractAuthSuccessCodeValue,
  TPayload
> {}
