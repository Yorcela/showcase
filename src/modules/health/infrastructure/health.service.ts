import { Inject, Injectable } from "@nestjs/common";

import { APP_CONFIG, AppConfig } from "@shared/modules/config/app.config";

import { DATABASE_PROBE_PORT, DatabaseProbePort } from "../application/port/database-probe.port";
import { HealthCheckDetailsDto } from "../interfaces/presenters/dto/check.dto";

export type DatabaseCheckResult = { status: "up" | "down"; responseTime?: number; error?: string };
export type MemoryCheck = {
  status: "up" | "warning";
  used: string;
  total: string;
  percentage: number;
};

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_PROBE_PORT) private readonly db: DatabaseProbePort,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  async checkDatabase(): Promise<DatabaseCheckResult> {
    try {
      const responseTime = await this.db.ping();
      return { status: "up", responseTime };
    } catch (e) {
      return { status: "down", error: e instanceof Error ? e.message : "Unknown error" };
    }
  }

  checkMemory(): MemoryCheck {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const percentage = Math.round((usedMB / totalMB) * 100);

    return {
      status: percentage > 90 ? "warning" : "up",
      used: `${usedMB}MB`,
      total: `${totalMB}MB`,
      percentage,
    };
  }

  getSystemDetails(startTime: number): HealthCheckDetailsDto {
    return {
      uptime: process.uptime(),
      version: this.appConfig.getAppVersion(),
      environment: this.appConfig.getNodeEnv(),
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      pid: process.pid,
      nodeVersion: process.version,
    };
  }
}
