import { Test, TestingModule } from "@nestjs/testing";

import { HealthController } from "./health.controller";
import { HealthCheckSuccess } from "../../domain/success/check.success";
import { HealthSuccessCode } from "../../domain/success/registry.success";
import {
  DatabaseCheckResult,
  HealthService,
  MemoryCheck,
} from "../../infrastructure/health.service";

describe("HealthController (e2e)", () => {
  let moduleRef: TestingModule;
  let controller: HealthController;

  const createDetails = () => ({
    uptime: 42,
    version: "1.0.0",
    environment: "test",
    timestamp: new Date().toISOString(),
    responseTime: 5,
    pid: 123,
    nodeVersion: "v18.0.0",
  });

  let serviceMock: jest.Mocked<HealthService>;

  beforeEach(async () => {
    serviceMock = {
      checkDatabase: jest.fn(),
      checkMemory: jest.fn(),
      getSystemDetails: jest.fn(),
    } as unknown as jest.Mocked<HealthService>;

    moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get(HealthController);
    jest.spyOn(Date, "now").mockReturnValue(1_000);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await moduleRef.close();
    jest.clearAllMocks();
  });

  it("should return an OK status when dependencies report healthy state", async () => {
    const databaseCheck: DatabaseCheckResult = { status: "up", responseTime: 10 };
    const memoryCheck: MemoryCheck = { status: "up", used: "50MB", total: "100MB", percentage: 50 };
    const details = createDetails();

    serviceMock.checkDatabase.mockResolvedValue(databaseCheck);
    serviceMock.checkMemory.mockReturnValue(memoryCheck);
    serviceMock.getSystemDetails.mockReturnValue(details);

    const result = await controller.getHealth();

    expect(result).toBeInstanceOf(HealthCheckSuccess);
    expect(result.code).toBe(HealthSuccessCode.CHECK_SUCCESSFUL);
    expect(result.payload).toEqual({
      status: "OK",
      info: {
        database: databaseCheck,
        memory: memoryCheck,
      },
      details,
    });
  });

  it("should surface error status when one of the checks reports failure", async () => {
    const databaseCheck: DatabaseCheckResult = { status: "down", error: "timeout" };
    const memoryCheck: MemoryCheck = {
      status: "warning",
      used: "95MB",
      total: "100MB",
      percentage: 95,
    };
    const details = createDetails();

    serviceMock.checkDatabase.mockResolvedValue(databaseCheck);
    serviceMock.checkMemory.mockReturnValue(memoryCheck);
    serviceMock.getSystemDetails.mockReturnValue(details);

    const result = await controller.getHealth();

    expect(result.payload.status).toBe("ERROR");
    expect(result.payload.info).toEqual({
      database: databaseCheck,
      memory: memoryCheck,
    });
  });
});
