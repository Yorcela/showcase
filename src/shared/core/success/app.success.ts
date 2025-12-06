import { AppSuccessCode, AppSuccessPayloadTypes } from "./registry.success";
import {
  SuccessCodeValue,
  SuccessPayloadBase,
  AbstractAppSuccess,
} from "../abstract/success.abstract";

export type AppSuccessCodeValue = SuccessCodeValue<typeof AppSuccessCode>;

export type AppSuccessPayloadType = SuccessPayloadBase;

export class AppSuccess<C extends AppSuccessCodeValue> extends AbstractAppSuccess<
  C,
  AppSuccessPayloadTypes[C]
> {
  constructor(code: C, payload: AppSuccessPayloadTypes[C]) {
    super(code, payload);
  }
}
