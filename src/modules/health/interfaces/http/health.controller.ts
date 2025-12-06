import { Controller, Get } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import { HealthCheckSwagger } from "./swagger/health.controller.swagger";
import { HealthCheckSuccess } from "../../domain/success/check.success";
import { HealthService } from "../../infrastructure/health.service";
import { HealthCheckPayloadDto } from "../presenters/dto/check.dto";

@HealthCheckSwagger.controller()
@Controller("health")
@Throttle({ health: {} })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthCheckSwagger.healthChek()
  async getHealth(): Promise<HealthCheckSuccess> {
    const startTime = Date.now();
    const checks = {
      database: await this.healthService.checkDatabase(),
      memory: this.healthService.checkMemory(),
    };
    const hasErrors = Object.values(checks).some((c: any) => c.status !== "up");
    const payload: HealthCheckPayloadDto = {
      status: hasErrors ? "ERROR" : "OK",
      info: checks,
      details: this.healthService.getSystemDetails(startTime),
    };
    return new HealthCheckSuccess(payload);
  }
}
