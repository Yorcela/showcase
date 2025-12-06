import {
  SuccessCodeValue,
  SuccessPayloadBase,
  AbstractAppSuccess,
} from "@shared/core/abstract/success.abstract";
import { UsersSuccessCode } from "./registry.success";

export type AbstractUsersSuccessCodeValue = SuccessCodeValue<typeof UsersSuccessCode>;
export type AbstractUsersSuccessPayloadType = SuccessPayloadBase;

export abstract class AbstractUsersSuccess<TPayload> extends AbstractAppSuccess<
  AbstractUsersSuccessCodeValue,
  TPayload
> {}
