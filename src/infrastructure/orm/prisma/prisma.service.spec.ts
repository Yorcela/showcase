import { Logger } from "@nestjs/common";

import { AppConfig } from "@shared/modules/config/app.config";

import { PrismaService } from "./prisma.service";

describe("PrismaService", () => {
  const makeAppConfig = (isTest: boolean) =>
    ({
      isTest: () => isTest,
      isProduction: () => !isTest,
    }) as Pick<AppConfig, "isTest"> as AppConfig;

  const makeLogger = () =>
    ({
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }) as unknown as Logger;

  const makeService = (isTest: boolean) => {
    const appConfig = makeAppConfig(isTest);
    const service = new PrismaService(appConfig);
    const logger = makeLogger();
    // Replace internal logger with our mock
    (service as any).logger = logger;
    return { service, logger };
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should connect and log success when connection succeeds (any env)", async () => {
    // Given
    const { service, logger } = makeService(false);
    const connectMock = jest.spyOn(service as any, "$connect").mockResolvedValue(undefined);
    const expectedConnectCalls = 1;
    const expectedMessage = expect.stringContaining("Database connected");

    // When
    await service.onModuleInit();

    // Then
    expect(connectMock).toHaveBeenCalledTimes(expectedConnectCalls);
    expect(logger.log).toHaveBeenCalledWith(expectedMessage);
    const expectedErrorCalls = 0;
    expect(logger.error).toHaveBeenCalledTimes(expectedErrorCalls);
  });

  it("should log connection error but not throw in test environment", async () => {
    // Given
    const { service, logger } = makeService(true); // isTest = true
    jest.spyOn(service as any, "$connect").mockRejectedValue(new Error("connect failure"));
    const expected = undefined;
    const expectedErrorCalls = 1;
    const expectedErrorMessage = expect.stringContaining("Failed to connect to database");
    const unexpectedLogMessage = expect.stringContaining("Database connected");

    // When
    const action = service.onModuleInit();

    // Then
    await expect(action).resolves.toBe(expected);
    expect(logger.error).toHaveBeenCalledTimes(expectedErrorCalls);
    expect(logger.error).toHaveBeenCalledWith(expectedErrorMessage, expect.any(Error));
    expect(logger.log).not.toHaveBeenCalledWith(unexpectedLogMessage);
  });

  it("should throw when connection fails outside prod environment", async () => {
    // Given
    const { service, logger } = makeService(false); // isTest = false
    const err = new Error("connect failure");
    jest.spyOn(service as any, "$connect").mockRejectedValue(err);
    const expected = err;
    const expectedErrorCalls = 1;
    const expectedErrorMessage = expect.stringContaining("Failed to connect to database");

    // When / Then
    await expect(service.onModuleInit()).rejects.toBe(expected);
    expect(logger.error).toHaveBeenCalledTimes(expectedErrorCalls);
    expect(logger.error).toHaveBeenCalledWith(expectedErrorMessage, err);
  });

  it("should disconnect cleanly on module destroy", async () => {
    // Given
    const { service, logger } = makeService(false);
    const disconnectMock = jest.spyOn(service as any, "$disconnect").mockResolvedValue(undefined);
    const expectedDisconnectCalls = 1;
    const expectedMessage = expect.stringContaining("Database disconnected");

    // When
    await service.onModuleDestroy();

    // Then
    expect(disconnectMock).toHaveBeenCalledTimes(expectedDisconnectCalls);
    expect(logger.log).toHaveBeenCalledWith(expectedMessage);
  });

  it("should log error if disconnection fails", async () => {
    // Given
    const { service, logger } = makeService(false);
    const error = new Error("disconnect error");
    const disconnectSpy = jest.spyOn(service as any, "$disconnect").mockRejectedValueOnce(error);
    const expectedErrorCalls = 1;
    const expectedErrorMessage = expect.stringContaining("Error disconnecting from database:");

    // When
    const action = service.onModuleDestroy();

    // Then
    await expect(action).resolves.toBeUndefined();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(expectedErrorCalls);
    expect(logger.error).toHaveBeenCalledWith(expectedErrorMessage, error);
  });

  it("should truncate public tables in test environment (excluding _prisma_migrations)", async () => {
    // Given
    const { service } = makeService(true); // isTest = true
    const queryMock = jest
      .spyOn(service as any, "$queryRaw")
      .mockResolvedValue([{ tablename: "users" }, { tablename: "_prisma_migrations" }]);
    const execMock = jest.spyOn(service as any, "$executeRawUnsafe").mockResolvedValue(0);
    const expectedQueryCalls = 1;
    const expectedExecCalls = 1;
    const expectedQuery = `TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`;

    // When
    await service.cleanDatabase();

    // Then
    expect(queryMock).toHaveBeenCalledTimes(expectedQueryCalls);
    expect(execMock).toHaveBeenCalledTimes(expectedExecCalls);
    expect(execMock).toHaveBeenCalledWith(expectedQuery);
  });

  it("should skip truncation outside test environment", async () => {
    // Given
    const { service } = makeService(false); // isTest = false
    const queryMock = jest.spyOn(service as any, "$queryRaw");
    const execMock = jest.spyOn(service as any, "$executeRawUnsafe");
    const expected = 0;

    // When
    await service.cleanDatabase();

    // Then
    expect(queryMock).toHaveBeenCalledTimes(expected);
    expect(execMock).toHaveBeenCalledTimes(expected);
  });

  it("should return prisma client itself when no transaction context provided", () => {
    const { service } = makeService(false);

    const result = service.getDb();

    expect(result).toBe(service);
  });

  it("should return transaction client when context provided", () => {
    const { service } = makeService(false);
    const tx = { tx: Symbol("tx") } as any;

    const result = service.getDb(tx);

    expect(result).toBe(tx.tx);
  });
});
