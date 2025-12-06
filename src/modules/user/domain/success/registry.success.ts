import {
  SuccessCodeName,
  SuccessCodeType,
  SuccessCodeValue,
  SuccessPayloadByCode,
} from "@shared/core/abstract/success.abstract";

import { UsersMePayloadDto } from "../../presenters/dto/user.dto";

export type UsersSuccessCodeName = SuccessCodeName<typeof UsersSuccessCode>;
export type UsersSuccessCodeValue = SuccessCodeValue<typeof UsersSuccessCode>;

export const UsersSuccessCode = {
  GETME_SUCCESSFUL: "USR_ME_001",
} as const satisfies SuccessCodeType & Record<string, `USR_${string}`>;

export type UsersSuccessPayloadTypes = SuccessPayloadByCode<UsersSuccessCodeValue> & {
  [UsersSuccessCode.GETME_SUCCESSFUL]: UsersMePayloadDto;
};
