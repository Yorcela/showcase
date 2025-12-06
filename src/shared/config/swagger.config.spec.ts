import { ConfigService } from "@nestjs/config";

import { setupSwagger } from "./swagger.config";

jest.mock("@nestjs/swagger", () => {
  const builderMock = {
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    setContact: jest.fn().mockReturnThis(),
    setLicense: jest.fn().mockReturnThis(),
    addServer: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    addApiKey: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({ swagger: true }),
  };
  return {
    __esModule: true,
    builderMock,
    DocumentBuilder: jest.fn().mockImplementation(() => builderMock),
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({ doc: true }),
      setup: jest.fn(),
    },
  };
});

const { SwaggerModule, builderMock } = jest.requireMock("@nestjs/swagger");

describe("setupSwagger", () => {
  const createAppMock = (configMap: Record<string, any>) => {
    const configService = {
      get: jest.fn((key: string, defaultValue?: any) =>
        key in configMap ? configMap[key] : defaultValue,
      ),
    } as unknown as ConfigService;

    const httpAdapterGet = jest.fn();
    const app = {
      get: jest.fn((token: unknown) => (token === ConfigService ? configService : null)),
      getHttpAdapter: jest.fn().mockReturnValue({ get: httpAdapterGet }),
    } as any;

    return { app, configService, httpAdapterGet };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should configure swagger UI when enabled", () => {
    // Given
    const config = {
      NODE_ENV: "test",
      SWAGGER_ENABLED: true,
      SWAGGER_PATH: "docs",
      APP_NAME: "yorcela",
      APP_VERSION: "1.2.3",
      FRONTEND_URL: "https://front.example",
      APP_URL: "https://api.example",
    };
    const { app, httpAdapterGet } = createAppMock(config);

    // When
    setupSwagger(app);

    // Then
    expect(builderMock.setTitle).toHaveBeenCalledWith("yorcela API");
    expect(builderMock.addServer).toHaveBeenCalledWith("https://api.example", "Serveur de test");
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      app,
      expect.any(Object),
      expect.any(Object),
    );
    const setupArgs = (SwaggerModule.setup as jest.Mock).mock.calls[0];
    expect(setupArgs[0]).toBe("docs");
    expect(setupArgs[1]).toBe(app);
    const options = setupArgs[3];
    const request = { headers: {} as Record<string, string> };
    options.swaggerOptions.requestInterceptor(request);
    expect(request.headers["Accept-Language"]).toBe("fr-FR,fr;q=0.9,en;q=0.8");
    expect(httpAdapterGet).toHaveBeenCalledWith("/docs-json", expect.any(Function));
  });

  it("should return early when swagger disabled", () => {
    // Given
    const config = {
      SWAGGER_ENABLED: false,
      APP_URL: "https://api.example",
    };
    const { app } = createAppMock(config);

    // When
    setupSwagger(app);

    // Then
    expect(SwaggerModule.createDocument).not.toHaveBeenCalled();
    expect(SwaggerModule.setup).not.toHaveBeenCalled();
  });

  it("should throw when APP_URL missing", () => {
    // Given
    const { app } = createAppMock({});

    // When / Then
    expect(() => setupSwagger(app)).toThrow("APP_URL environment variable is required");
  });
});
