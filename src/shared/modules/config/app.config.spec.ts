import { ConfigService } from "@nestjs/config";

import { Dictionnary } from "@apptypes/dictionnary.type";

import { AppConfig } from "./app.config";

describe("AppConfig", () => {
  const createConfig = (values: Dictionnary) => {
    const configService = {
      getOrThrow: jest.fn((key: string) => {
        if (!(key in values)) throw new Error(`Missing ${key}`);
        return values[key];
      }),
    } as unknown as ConfigService;

    return new AppConfig(configService);
  };

  it("should expose application getters", () => {
    // Given
    const cfg = createConfig({
      ORM_PROVIDER: "PRISMA",
      NODE_ENV: "production",
      PORT: 3000,
      API_PREFIX: "api",
      APP_NAME: "yorcela",
      APP_VERSION: "1.0.0",
      APP_URL: "https://api.example",
      FRONTEND_URL: "https://front.example",
      CORS_ORIGINS: "https://a.com, https://b.com",
      CORS_CREDENTIALS: true,
      APP_OTP_EXPIRATION_IN_MINUTES: 3,
      APP_LANGUAGES: "fr,en",
      APP_DEFAULT_LANGUAGE: "fr",
    });

    // When / Then
    expect(cfg.getOrm()).toBe("prisma");
    expect(cfg.getNodeEnv()).toBe("production");
    expect(cfg.isProduction()).toBe(true);
    expect(cfg.isTest()).toBe(false);
    expect(cfg.getPort()).toBe(3000);
    expect(cfg.getApiPrefix()).toBe("api");
    expect(cfg.getAppName()).toBe("yorcela");
    expect(cfg.getAppVersion()).toBe("1.0.0");
    expect(cfg.getAppUrl()).toBe("https://api.example");
    expect(cfg.getFrontendUrl()).toBe("https://front.example");
    expect(cfg.getCorsOrigins()).toEqual(["https://front.example", "https://api.example"]);
    expect(cfg.getOtpExpirationInMinutes()).toBe(30);
    expect(cfg.getOtpExpirationTime()).toBe(30);
    expect(cfg.getAppLanguages()).toEqual(["fr", "en"]);
    expect(cfg.getAppDefaultLanguage()).toBe("fr");
  });

  it("should detect test environment", () => {
    // Given
    const cfg = createConfig({ NODE_ENV: "test", ORM_PROVIDER: "memory" });

    // When / Then
    expect(cfg.isTest()).toBe(true);
    expect(cfg.isProduction()).toBe(false);
    expect(cfg.getOrm()).toBe("memory");
  });

  it("should expose security configuration", () => {
    // Given
    const cfg = createConfig({
      JWT_SECRET: "secret",
      JWT_ACCESS_EXPIRES_IN: "5m",
      JWT_REFRESH_EXPIRES_IN: "7d",
      JWT_REFRESH_EXPIRES_IN_REMEMBERME: "30d",
      ARGON2_MEMORY: 1024,
      ARGON2_ITERATIONS: 2,
      ARGON2_PARALLELISM: 1,
    });

    // When / Then
    expect(cfg.getJwtSecret()).toBe("secret");
    expect(cfg.getJwtAccessExpiresIn()).toBe("5m");
    expect(cfg.getArgon2Memory()).toBe(1024);
  });

  it("should compute jwt expiry timestamps", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    const cfg = createConfig({
      JWT_ACCESS_EXPIRES_IN: "2m",
      JWT_REFRESH_EXPIRES_IN: "3m",
      JWT_REFRESH_EXPIRES_IN_REMEMBERME: "5m",
    });

    expect(cfg.getJwtAccessExpiresInTimestamp()).toBe(
      new Date("2024-01-01T00:02:00.000Z").getTime(),
    );
    expect(cfg.getJwtRefreshExpiresInTimestamp()).toBe(
      new Date("2024-01-01T00:03:00.000Z").getTime(),
    );
    expect(cfg.getJwtRefreshExpiresInRememberInTimestamp()).toBe(
      new Date("2024-01-01T00:05:00.000Z").getTime(),
    );
    jest.useRealTimers();
  });

  it("should expose rate limiting configuration", () => {
    // Given
    const cfg = createConfig({
      RATE_LIMIT_TTL: 60,
      RATE_LIMIT_MAX: 100,
      RATE_LIMIT_AUTH_TTL: 30,
      RATE_LIMIT_AUTH_MAX: 10,
    });

    // When / Then
    expect(cfg.getRateLimitTtl()).toBe(60);
    expect(cfg.getRateLimitMax()).toBe(100);
    expect(cfg.getRateLimitAuthTtl()).toBe(30);
    expect(cfg.getRateLimitAuthMax()).toBe(10);
  });

  it("should expose email configuration", () => {
    // Given
    const cfg = createConfig({
      EMAIL_PROVIDER: "mailhog",
      EMAIL_RENDERER: "handlebars",
      EMAIL_FROM: "no-reply@example.com",
      EMAIL_SUPPORT: "support@example.com",
      MAILHOG_HOST: "localhost",
      MAILHOG_PORT: 1025,
      MAILHOG_WEB_PORT: 8025,
    });

    // When / Then
    expect(cfg.getEmailProvider()).toBe("mailhog");
    expect(cfg.getEmailRenderer()).toBe("handlebars");
    expect(cfg.getEmailFrom()).toBe("no-reply@example.com");
    expect(cfg.getEmailSupport()).toBe("support@example.com");
    expect(cfg.getMailhogHost()).toBe("localhost");
    expect(cfg.getMailhogPort()).toBe(1025);
    expect(cfg.getMailhogWebPort()).toBe(8025);
  });

  it("should expose swagger configuration", () => {
    // Given
    const cfg = createConfig({
      SWAGGER_ENABLED: true,
      SWAGGER_USER: "user",
      SWAGGER_PASSWORD: "pass",
      SWAGGER_PATH: "docs",
    });

    // When / Then
    expect(cfg.isSwaggerEnabled()).toBe(true);
    expect(cfg.getSwaggerPath()).toBe("docs");
  });

  it("should expose upload configuration", () => {
    // Given
    const cfg = createConfig({
      UPLOAD_MAX_SIZE: 1024,
      UPLOAD_ALLOWED_TYPES: "image/png,image/jpeg",
      UPLOAD_DEST: "uploads",
    });

    // When / Then
    expect(cfg.getUploadMaxSize()).toBe(1024);
    expect(cfg.getUploadAllowedTypes()).toEqual(["image/png", "image/jpeg"]);
    expect(cfg.getUploadDestination()).toBe("uploads");
  });

  it("should parse jwt durations with supported units", () => {
    const cfg = createConfig({
      JWT_SECRET: "secret",
      JWT_ACCESS_EXPIRES_IN: "45s",
      JWT_REFRESH_EXPIRES_IN: "10m",
      JWT_REFRESH_EXPIRES_IN_REMEMBERME: "2h",
    });

    expect(cfg.getJwtAccessExpiresInSeconds()).toBe(45);
    expect(cfg.getJwtAccessExpiresInMinutes()).toBe(1);
    expect(cfg.getJwtRefreshExpiresInSeconds()).toBe(600);
    expect(cfg.getJwtRefreshExpiresInMinutes()).toBe(10);
    expect(cfg.getJwtRefreshExpiresInRememberInSeconds()).toBe(7200);
    expect(cfg.getJwtRefreshExpiresInRememberInMinutes()).toBe(120);
  });

  it("should support day duration format and throw on invalid format", () => {
    const valid = createConfig({
      JWT_ACCESS_EXPIRES_IN: "1d",
    });
    expect(valid.getJwtAccessExpiresInSeconds()).toBe(86_400);
    expect(valid.getJwtAccessExpiresInMinutes()).toBe(1_440);

    const invalid = createConfig({
      JWT_ACCESS_EXPIRES_IN: "abc",
    });
    expect(() => invalid.getJwtAccessExpiresInSeconds()).toThrow("Invalid duration format: abc");
  });

  it("should support bare duration seconds and reject invalid unit format", () => {
    const secondsOnly = createConfig({
      JWT_ACCESS_EXPIRES_IN: "120",
    });
    expect(secondsOnly.getJwtAccessExpiresInSeconds()).toBe(120);

    const unknownUnit = createConfig({
      JWT_ACCESS_EXPIRES_IN: "10w",
    });
    expect(() => unknownUnit.getJwtAccessExpiresInSeconds()).toThrow(
      "Invalid duration format: 10w",
    );
  });
});
