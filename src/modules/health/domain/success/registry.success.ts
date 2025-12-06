import {
  SuccessCodeName,
  SuccessCodeType,
  SuccessCodeValue,
  SuccessPayloadByCode,
} from "@shared/core/abstract/success.abstract";

import { HealthCheckPayloadType } from "./check.success";

export type HealthSuccessCodeName = SuccessCodeName<typeof HealthSuccessCode>;
export type HealthSuccessCodeValue = SuccessCodeValue<typeof HealthSuccessCode>;

export const HealthSuccessCode = {
  // Registration success
  CHECK_SUCCESSFUL: "HEA_CHE_S001",
} as const satisfies SuccessCodeType & Record<string, `HEA_${string}`>;

export type HealthSuccessPayloadTypes = SuccessPayloadByCode<HealthSuccessCodeValue> & {
  // Registration
  [HealthSuccessCode.CHECK_SUCCESSFUL]: HealthCheckPayloadType;
};
