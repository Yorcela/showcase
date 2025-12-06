import { AbstractHealthSuccess } from "./abstract.success";
import { HealthSuccessCode } from "./registry.success";
import { HealthCheckPayloadDto } from "../../interfaces/presenters/dto/check.dto";

// HealthCheckSuccess
export type HealthCheckPayloadType = HealthCheckPayloadDto;
export class HealthCheckSuccess extends AbstractHealthSuccess<HealthCheckPayloadType> {
  constructor(payload: HealthCheckPayloadType) {
    super(HealthSuccessCode.CHECK_SUCCESSFUL, payload);
  }
}
