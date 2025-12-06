import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
  ApiOperationWithBody,
  ApiResponseEnvelope,
} from "@shared/presenters/swagger/response.decorator.swagger";

import { HealthCheckPayloadDto } from "../../presenters/dto/check.dto";

export const HealthCheckSwagger = {
  controller: () => applyDecorators(ApiTags("health")),
  healthChek: (successStatus: HttpStatus = HttpStatus.OK) =>
    applyDecorators(
      ApiOperationWithBody({
        summary: "API health check",
        description: "Basic endpoint returning information to know the API health",
      }),
      ApiResponseEnvelope({
        model: HealthCheckPayloadDto,
        successStatus,
        errors: [],
      }),
    ),
};
