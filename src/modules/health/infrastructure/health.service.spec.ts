import { AppConfig } from "@shared/modules/config/app.config";

import { HealthService } from "./health.service";
import { DatabaseProbePort } from "../application/port/database-probe.port";

describe("HealthService", () => {
  let databaseProbe: jest.Mocked<DatabaseProbePort>;
  let appConfig: Pick<AppConfig, "getAppVersion" | "getNodeEnv">;
  let service: HealthService;

  beforeEach(() => {
    databaseProbe = {
      ping: jest.fn<Promise<number>, []>(),
    } as unknown as jest.Mocked<DatabaseProbePort>;

    appConfig = {
      getAppVersion: jest.fn().mockReturnValue("1.0.0"),
      getNodeEnv: jest.fn().mockReturnValue("test"),
    };

    service = new HealthService(databaseProbe, appConfig as AppConfig);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("checkDatabase", () => {
    it("should return an up status with response time when the database responds", async () => {
      databaseProbe.ping.mockResolvedValueOnce(15);

      const result = await service.checkDatabase();

      expect(databaseProbe.ping).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ status: "up", responseTime: 15 });
    });

    it("should return a down status when the database query throws", async () => {
      const error = new Error("db error");
      databaseProbe.ping.mockRejectedValueOnce(error);

      const result = await service.checkDatabase();

      expect(result).toEqual({ status: "down", error: "db error" });
    });

    it("should return unknown error when non-error object is thrown", async () => {
      databaseProbe.ping.mockRejectedValueOnce("boom");

      const result = await service.checkDatabase();

      expect(result).toEqual({ status: "down", error: "Unknown error" });
    });
  });

  describe("checkMemory", () => {
    it("should compute memory usage and return an up status", () => {
      const memoryUsageSpy = jest.spyOn(process, "memoryUsage").mockReturnValue({
        rss: 0,
        heapTotal: 200 * 1024 * 1024,
        heapUsed: 100 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
      } as unknown as NodeJS.MemoryUsage);

      const result = service.checkMemory();

      expect(memoryUsageSpy).toHaveBeenCalled();
      expect(result).toEqual({
        status: "up",
        used: "100MB",
        total: "200MB",
        percentage: 50,
      });
    });

    it("should flag warning when memory usage exceeds 90 percent", () => {
      jest.spyOn(process, "memoryUsage").mockReturnValue({
        rss: 0,
        heapTotal: 100 * 1024 * 1024,
        heapUsed: 95 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
      } as unknown as NodeJS.MemoryUsage);

      const result = service.checkMemory();

      expect(result.status).toBe("warning");
      expect(result.percentage).toBe(95);
    });
  });

  describe("getSystemDetails", () => {
    it("should gather system details using app config values", () => {
      const uptimeSpy = jest.spyOn(process, "uptime").mockReturnValue(42);
      const dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(2_000);
      const startTime = 1_900;

      const details = service.getSystemDetails(startTime);

      expect(uptimeSpy).toHaveBeenCalled();
      expect(appConfig.getAppVersion).toHaveBeenCalled();
      expect(appConfig.getNodeEnv).toHaveBeenCalled();
      expect(details).toMatchObject({
        uptime: 42,
        version: "1.0.0",
        environment: "test",
        responseTime: 100,
        pid: process.pid,
        nodeVersion: process.version,
      });
      expect(typeof details.timestamp).toBe("string");
      expect(new Date(details.timestamp).toString()).not.toBe("Invalid Date");
      expect(dateNowSpy).toHaveBeenCalled();
    });
  });
});
