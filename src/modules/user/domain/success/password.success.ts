import { AbstractUsersSuccess } from "./abstract.success";
import { UsersSuccessCode } from "./registry.success";
import { UsersMePayloadDto } from "../../presenters/dto/user.dto";

// UsersGetMeSuccess
export type UsersGetMeSuccessPayloadType = UsersMePayloadDto;
export class UsersGetMeSuccess extends AbstractUsersSuccess<UsersGetMeSuccessPayloadType> {
  constructor(payload: UsersGetMeSuccessPayloadType) {
    super(UsersSuccessCode.GETME_SUCCESSFUL, payload);
  }
}
