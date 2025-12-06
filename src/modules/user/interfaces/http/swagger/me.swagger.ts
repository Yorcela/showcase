import { HttpStatus } from "@nestjs/common";

import { createEndpointSwagger } from "@shared/interfaces/http/swagger/endpoint.swagger";
import { UsersMePayloadDto } from "../../../presenters/dto/user.dto";

export const MeSwagger = createEndpointSwagger({
  tag: "me",
  summary: "Get user informations",
  description: "Get informations for currently logged user.",
  response: UsersMePayloadDto,
  defaultStatus: HttpStatus.OK,
  needsCookieAuth: true,
  errors: [],
});
