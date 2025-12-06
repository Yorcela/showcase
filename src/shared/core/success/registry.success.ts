import { AppSuccessPayloadType } from "./app.success";
import {
  SuccessCodeName,
  SuccessCodeType,
  SuccessCodeValue,
  SuccessPayloadByCode,
} from "../abstract/success.abstract";

export type AppSuccessCodeName = SuccessCodeName<typeof AppSuccessCode>;
export type AppSuccessCodeValue = SuccessCodeValue<typeof AppSuccessCode>;

export const AppSuccessCode = {
  OK: "APP_GEN_001",
} as const satisfies SuccessCodeType & Record<string, `APP_${string}`>;

export type AppSuccessPayloadTypes = SuccessPayloadByCode<AppSuccessCodeValue> & {
  [AppSuccessCode.OK]: AppSuccessPayloadType;
};
