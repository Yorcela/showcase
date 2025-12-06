import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const APP_CONFIG = Symbol("APP_CONFIG");

@Injectable()
export class AppConfig {
  constructor(private readonly config: ConfigService) {}

  // ================================
  // ⚙️ APPLICATION
  // ================================
  getOrm = (): string => this.config.getOrThrow<string>("ORM_PROVIDER").toLowerCase();
  getNodeEnv = (): string => this.config.getOrThrow<string>("NODE_ENV").toLowerCase();
  isProduction = (): boolean => this.getNodeEnv() === "production";
  isTest = (): boolean => this.getNodeEnv() === "test";
  getPort = (): number => this.config.getOrThrow<number>("PORT");
  getApiPrefix = (): string => this.config.getOrThrow<string>("API_PREFIX");
  getAppName = (): string => this.config.getOrThrow<string>("APP_NAME");
  getAppVersion = (): string => this.config.getOrThrow<string>("APP_VERSION");
  getAppUrl = (): string => this.config.getOrThrow<string>("APP_URL");
  getFrontendUrl = (): string => this.config.getOrThrow<string>("FRONTEND_URL");
  getCorsOrigins = (): string[] => [this.getFrontendUrl(), this.getAppUrl()].map((o) => o.trim());
  getOtpExpirationInMinutes = (): number =>
    this.config.getOrThrow<number>("APP_OTP_EXPIRATION_IN_MINUTES") * 10;
  getOtpExpirationTime = (): number =>
    this.config.getOrThrow<number>("APP_OTP_EXPIRATION_IN_MINUTES") * 10;
  getAppLanguages = (): string[] =>
    this.config
      .getOrThrow<string>("APP_LANGUAGES")
      .split(",")
      .map((o) => o.trim());
  getAppDefaultLanguage = (): string => this.config.getOrThrow<string>("APP_DEFAULT_LANGUAGE");

  // ================================
  // 🔐 SECURITY & JWT
  // ================================
  getJwtSecret = (): string => this.config.getOrThrow<string>("JWT_SECRET");
  // Access Jwt expiration
  getJwtAccessExpiresIn = (): string => this.config.getOrThrow<string>("JWT_ACCESS_EXPIRES_IN");
  getJwtAccessExpiresInSeconds = (): number => parseDurationToSeconds(this.getJwtAccessExpiresIn());
  getJwtAccessExpiresInMinutes = (): number => parseDurationToMinutes(this.getJwtAccessExpiresIn());
  getJwtAccessExpiresInTimestamp = (): number =>
    generateJwtExpirationTimeStamp(this.getJwtAccessExpiresInMinutes());
  // Refresh Jwt expiration
  getJwtRefreshExpiresIn = (): string => this.config.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN");
  getJwtRefreshExpiresInSeconds = (): number =>
    parseDurationToSeconds(this.getJwtRefreshExpiresIn());
  getJwtRefreshExpiresInMinutes = (): number =>
    parseDurationToMinutes(this.getJwtRefreshExpiresIn());
  getJwtRefreshExpiresInTimestamp = (): number =>
    generateJwtExpirationTimeStamp(this.getJwtRefreshExpiresInMinutes());
  // Refresh Jwt with rememberme expiration
  getJwtRefreshExpiresInRemember = (): string =>
    this.config.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN_REMEMBERME");
  getJwtRefreshExpiresInRememberInSeconds = (): number =>
    parseDurationToSeconds(this.getJwtRefreshExpiresInRemember());
  getJwtRefreshExpiresInRememberInMinutes = (): number =>
    parseDurationToMinutes(this.getJwtRefreshExpiresInRemember());
  getJwtRefreshExpiresInRememberInTimestamp = (): number =>
    generateJwtExpirationTimeStamp(this.getJwtRefreshExpiresInRememberInMinutes());

  // ================================
  // 🔑 PASSWORD HASHING (Argon2)
  // ================================
  getArgon2Memory = (): number => this.config.getOrThrow<number>("ARGON2_MEMORY");
  getArgon2Iterations = (): number => this.config.getOrThrow<number>("ARGON2_ITERATIONS");
  getArgon2Parallelism = (): number => this.config.getOrThrow<number>("ARGON2_PARALLELISM");

  // ================================
  // 🚦 RATE LIMITING
  // ================================
  getRateLimitTtl = (): number => this.config.getOrThrow<number>("RATE_LIMIT_TTL");
  getRateLimitMax = (): number => this.config.getOrThrow<number>("RATE_LIMIT_MAX");
  getRateLimitAuthTtl = (): number => this.config.getOrThrow<number>("RATE_LIMIT_AUTH_TTL");
  getRateLimitAuthMax = (): number => this.config.getOrThrow<number>("RATE_LIMIT_AUTH_MAX");

  // ================================
  // 📧 EMAIL CONFIGURATION
  // ================================
  getEmailProvider = (): string => this.config.getOrThrow<string>("EMAIL_PROVIDER");
  getEmailRenderer = (): string => this.config.getOrThrow<string>("EMAIL_RENDERER");
  getEmailFrom = (): string => this.config.getOrThrow<string>("EMAIL_FROM");
  getEmailSupport = (): string => this.config.getOrThrow<string>("EMAIL_SUPPORT");
  getMailhogHost = (): string => this.config.getOrThrow<string>("MAILHOG_HOST");
  getMailhogPort = (): number => this.config.getOrThrow<number>("MAILHOG_PORT");
  getMailhogWebPort = (): number => this.config.getOrThrow<number>("MAILHOG_WEB_PORT");

  // ================================
  // 🧰 SWAGGER (development TOOLS)
  // ================================
  isSwaggerEnabled = (): boolean => this.config.getOrThrow<boolean>("SWAGGER_ENABLED");
  getSwaggerUser = (): string => this.config.getOrThrow<string>("SWAGGER_USER");
  getSwaggerPassword = (): string => this.config.getOrThrow<string>("SWAGGER_PASSWORD");
  getSwaggerPath = (): string => this.config.getOrThrow<string>("SWAGGER_PATH");

  // ================================
  // 📂 UPLOADS
  // ================================
  getUploadMaxSize = (): number => this.config.getOrThrow<number>("UPLOAD_MAX_SIZE");
  getUploadAllowedTypes = (): string[] =>
    this.config
      .getOrThrow<string>("UPLOAD_ALLOWED_TYPES")
      .split(",")
      .map((t) => t.trim());
  getUploadDestination = (): string => this.config.getOrThrow<string>("UPLOAD_DEST");
}

function parseDurationToMinutes(value: string): number {
  return Math.round(parseDurationToSeconds(value) / 60);
}

function parseDurationToSeconds(value: string): number {
  const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration format: ${value}`);

  const amount = parseInt(match[1], 10);
  const unit = match[2] ?? "s";

  switch (unit) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    case "d":
      return amount * 60 * 60 * 24;
    default:
      throw new Error(`Unknown duration unit: ${unit}`);
  }
}

function generateJwtExpirationTimeStamp(minutes: number = 10): number {
  return generateJwtExpirationDate(minutes).getTime();
}

function generateJwtExpirationDate(minutes: number = 10): Date {
  return new Date(Date.now() + minutes * 60_000);
}
