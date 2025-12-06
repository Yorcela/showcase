// src/modules/health/presenters/dto/health.dto.ts
import { ApiProperty } from "@nestjs/swagger";

import {
  SwaggerHealthStatus,
  SwaggerHealthNodeUptime,
  SwaggerAppVersion,
  SwaggerAppEnvironment,
  SwaggerHealthTimestamp,
  SwaggerHealthResponseTime,
  SwaggerHealthNodePid,
  SwaggerHealthNodeVersion,
  SwaggerHealthInfoObject,
} from "../swagger/health.decorator.swagger";

export class HealthCheckDetailsDto {
  @SwaggerHealthNodeUptime(true)
  uptime!: number;

  @SwaggerAppVersion(true)
  version!: string;

  @SwaggerAppEnvironment(true)
  environment!: string;

  @SwaggerHealthTimestamp(true)
  timestamp!: string;

  @SwaggerHealthResponseTime(true)
  responseTime!: number;

  @SwaggerHealthNodePid(true)
  pid!: number;

  @SwaggerHealthNodeVersion(true)
  nodeVersion!: string;
}

export class HealthCheckPayloadDto {
  @SwaggerHealthStatus(true)
  status!: string;

  @SwaggerHealthInfoObject(false)
  info?: Record<string, unknown>;

  @ApiProperty({ type: () => HealthCheckDetailsDto, required: true })
  details!: HealthCheckDetailsDto;
}
