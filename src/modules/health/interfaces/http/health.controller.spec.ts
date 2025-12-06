import { HealthController } from "./health.controller";
import { HealthCheckSuccess } from "../../domain/success/check.success";
import { HealthSuccessCode } from "../../domain/success/registry.success";
import {
  DatabaseCheckResult,
  HealthService,
  MemoryCheck,
} from "../../infrastructure/health.service";

describe("HealthController", () => {
  let controller: HealthController;
  let healthService: jest.Mocked<HealthService>;

  const makeDetails = () => ({
    uptime: 100,
    version: "1.0.0",
    environment: "test",
    timestamp: new Date().toISOString(),
    responseTime: 5,
    pid: 123,
    nodeVersion: "v18.0.0",
  });

  beforeEach(() => {
    healthService = {
      checkDatabase: jest.fn(),
      checkMemory: jest.fn(),
      getSystemDetails: jest.fn(),
    } as unknown as jest.Mocked<HealthService>;

    controller = new HealthController(healthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return health check success when all checks are up", async () => {
    const startTime = 1_000;
    const databaseCheck: DatabaseCheckResult = { status: "up", responseTime: 10 };
    const memoryCheck: MemoryCheck = { status: "up", used: "50MB", total: "100MB", percentage: 50 };
    const details = makeDetails();

    jest.spyOn(Date, "now").mockReturnValue(startTime);
    healthService.checkDatabase.mockResolvedValue(databaseCheck);
    healthService.checkMemory.mockReturnValue(memoryCheck);
    healthService.getSystemDetails.mockReturnValue(details);

    const result = await controller.getHealth();

    expect(Date.now).toHaveBeenCalledTimes(1);
    expect(healthService.checkDatabase).toHaveBeenCalledTimes(1);
    expect(healthService.checkMemory).toHaveBeenCalledTimes(1);
    expect(healthService.getSystemDetails).toHaveBeenCalledWith(startTime);
    expect(result).toBeInstanceOf(HealthCheckSuccess);
    expect(result.code).toBe(HealthSuccessCode.CHECK_SUCCESSFUL);
    expect(result.payload).toEqual({
      status: "OK",
      info: { database: databaseCheck, memory: memoryCheck },
      details,
    });
  });

  it("should set error status when any check fails", async () => {
    const startTime = 2_000;
    const databaseCheck: DatabaseCheckResult = { status: "down", error: "connection failed" };
    const memoryCheck: MemoryCheck = { status: "up", used: "75MB", total: "100MB", percentage: 75 };
    const details = makeDetails();

    jest.spyOn(Date, "now").mockReturnValue(startTime);
    healthService.checkDatabase.mockResolvedValue(databaseCheck);
    healthService.checkMemory.mockReturnValue(memoryCheck);
    healthService.getSystemDetails.mockReturnValue(details);

    const result = await controller.getHealth();

    expect(result.payload).toEqual({
      status: "ERROR",
      info: { database: databaseCheck, memory: memoryCheck },
      details,
    });
  });
});
