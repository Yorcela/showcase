import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

const REQUIRED_ENV: Record<string, string> = {
  ORM_PROVIDER: "prisma",
  NODE_ENV: "test",
  PORT: "3000",
  API_PREFIX: "api",
  APP_NAME: "tallae",
  APP_VERSION: "1.0.0",
  APP_URL: "http://localhost:3000",
  FRONTEND_URL: "http://localhost:4200",
  CORS_ORIGINS: "http://localhost:4200",
  CORS_CREDENTIALS: "true",
  APP_OTP_EXPIRATION_IN_MINUTES: "5",
  APP_LANGUAGES: "en,fr",
  APP_DEFAULT_LANGUAGE: "en",
  JWT_SECRET: "secret",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  JWT_REFRESH_EXPIRES_IN_REMEMBERME: "30d",
  ARGON2_MEMORY: "1024",
  ARGON2_ITERATIONS: "3",
  ARGON2_PARALLELISM: "1",
  RATE_LIMIT_TTL: "60",
  RATE_LIMIT_MAX: "60",
  RATE_LIMIT_AUTH_TTL: "60",
  RATE_LIMIT_AUTH_MAX: "5",
  EMAIL_PROVIDER: "mailhog",
  EMAIL_RENDERER: "handlebars",
  EMAIL_FROM: "noreply@tallae.local",
  MAILHOG_HOST: "localhost",
  MAILHOG_PORT: "1025",
  MAILHOG_WEB_PORT: "8025",
  SWAGGER_ENABLED: "false",
  SWAGGER_USER: "admin",
  SWAGGER_PASSWORD: "admin",
  SWAGGER_PATH: "/docs",
  UPLOAD_MAX_SIZE: "5242880",
  UPLOAD_ALLOWED_TYPES: "image/png,image/jpeg",
  UPLOAD_DEST: "./uploads",
};

describe("Application bootstrap", () => {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    Object.assign(process.env, REQUIRED_ENV);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should create the Nest application successfully", async () => {
    const close = jest.fn().mockResolvedValue(undefined);
    const createSpy = jest.spyOn(NestFactory, "create").mockResolvedValue({ close } as any);

    const app = await NestFactory.create(AppModule, { logger: false });
    await app.close();

    expect(createSpy).toHaveBeenCalledWith(AppModule, { logger: false });
    expect(close).toHaveBeenCalledTimes(1);
    createSpy.mockRestore();
  });
});
