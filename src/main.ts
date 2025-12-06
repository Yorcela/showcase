import "reflect-metadata";
import { join } from "path";
import { Logger, ValidationPipe, LogLevel, VersioningType } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import {
  DATABASE_PROBE_PORT,
  DatabaseProbePort,
} from "@modules/health/application/port/database-probe.port";
import { setupSwagger } from "@shared/config/swagger.config";
import { AppErrorFilter } from "@shared/interfaces/http/error.filter";
import { AppResponseInterceptor } from "@shared/interfaces/http/response.interceptor";
import { AppConfig } from "@shared/modules/config/app.config";
import { GlobalSanitizerInterceptor } from "@shared/modules/sanitizer/global.interceptor";
import { GlobalValidatorPipe } from "@shared/pipes/global.pipe";
import { AppModule } from "./app.module";

async function bootstrap() {
  await attachProviderDiagnosticsForDev();
  // ================================
  // APP INIT
  // ================================
  // Logs
  const logLevels: LogLevel[] = process.env.LOG_LEVELS
    ? (process.env.LOG_LEVELS.split(",") as LogLevel[])
    : (["log", "error", "warn"] as LogLevel[]);
  // NestApp setup
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logLevels,
  });
  // NestApp setup
  const appConfig = app.get(AppConfig);
  const reflector = app.get(Reflector);
  const isProd = appConfig.isProduction();
  // Hooks d’arrêt propre (SIGINT/SIGTERM)
  app.enableShutdownHooks();

  // ================================
  // APP VERSION
  // ================================
  app.setGlobalPrefix(appConfig.getApiPrefix());
  app.enableVersioning({ type: VersioningType.URI }); // => /v1/...

  // ================================
  // SECURITY
  // ================================
  // CROSS ORIGIN
  if (isProd) {
    app.use(helmet());
  } else {
    app.use(
      helmet({
        hsts: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            upgradeInsecureRequests: null,
            blockAllMixedContent: null,
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: [
              "'self'",
              "http://localhost:3000",
              "ws:",
              "wss:",
              "blob:",
              "data:",
              "https://*.githubpreview.dev",
            ],
            workerSrc: ["'self'", "blob:"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'self'"],
          },
        },
      }),
    );
  }
  app.enableCors({
    origin: appConfig.getCorsOrigins(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  });
  // COOKIES
  app.use(cookieParser());

  // ================================
  // ASSETS
  // ================================
  // Swagger
  if (!isProd) {
    setupSwagger(app);
  }
  // Static assets
  app.useStaticAssets(join(__dirname, "..", "public"));

  // ================================
  // FILTERS / PIPES / INTERCEPTORS
  // ================================
  // Pipes globaux
  app.useGlobalPipes(new ValidationPipe({ transform: true }), app.get(GlobalValidatorPipe));
  // Filters globaux
  app.useGlobalFilters(new AppErrorFilter());
  // Interceptors globaux
  app.useGlobalInterceptors(
    app.get(GlobalSanitizerInterceptor),
    new AppResponseInterceptor(reflector),
  );

  // ================================
  // DATABASE
  // ================================
  await softDatabaseWarmup(app).catch(() => {});

  // ================================
  // LAUNCH APP
  // ================================
  // Start HTTP server
  await app.listen(appConfig.getPort(), "0.0.0.0");
  // Logs utiles
  const baseUrl = await app.getUrl();
  Logger.log(`Environnement: ${appConfig.getNodeEnv()}`, "Bootstrap");
  Logger.log(`Serveur: ${baseUrl}`, "Bootstrap");
  if (!isProd) {
    Logger.log(`Swagger: ${appConfig.getAppUrl()}/${appConfig.getSwaggerPath()}`, "Bootstrap");
  }
}

bootstrap();

/**
 * Essaie de pinger la base si un adaptateur de probe est bindé.
 * N’émet qu’un warning en cas d’échec, pour ne pas bloquer le boot.
 */
async function softDatabaseWarmup(app: NestExpressApplication): Promise<void> {
  try {
    // Si le token n’est pas bindé (ex: pas d’ORM en local), Nest va throw.
    const probe = app.get<DatabaseProbePort>(DATABASE_PROBE_PORT, { strict: false });
    if (!probe) {
      Logger.log("Aucun adaptateur DB probe détecté — warm-up ignoré.", "DBWarmup");
      return;
    }

    const start = Date.now();
    const ms = await probe.ping();
    Logger.log(`DB ping OK (${ms}ms) — warm-up en ${Date.now() - start}ms.`, "DBWarmup");
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown DB error";
    Logger.warn(`DB ping KO: ${msg} — l’application démarre quand même.`, "DBWarmup");
  }
}

/**
 * Diagnostics “dev” pour traquer les providers undefined / mal enregistrés.
 */
async function attachProviderDiagnosticsForDev() {
  if (process.env.NODE_ENV === "production") return;
  try {
    const coreInjector = await import("@nestjs/core/injector/module");
    const diagnosticsLogger = new Logger("ProviderDiagnostics");
    const ModuleCtor = coreInjector?.Module as
      | (new (...args: any[]) => {
          metatype?: { name?: string };
          addProvider?: (provider: unknown, enhancerSubtype?: unknown) => unknown;
          addCustomProvider?: (
            provider: any,
            collection: Map<any, any>,
            enhancerSubtype?: unknown,
          ) => unknown;
        })
      | undefined;

    if (!ModuleCtor?.prototype) {
      diagnosticsLogger.warn("Nest core Module introuvable ; diagnostics désactivés.");
      return;
    }

    const originalAddProvider = ModuleCtor.prototype.addProvider;
    if (typeof originalAddProvider === "function") {
      ModuleCtor.prototype.addProvider = function (provider: unknown, enhancerSubtype?: unknown) {
        const moduleRef = this as { metatype?: { name?: string } };
        if (provider === undefined) {
          diagnosticsLogger.error(
            `Provider 'undefined' détecté dans ${moduleRef?.metatype?.name ?? "UnknownModule"}`,
          );
        }
        return originalAddProvider.call(this, provider, enhancerSubtype);
      };
    }

    const originalAddCustomProvider = ModuleCtor.prototype.addCustomProvider;
    if (typeof originalAddCustomProvider === "function") {
      ModuleCtor.prototype.addCustomProvider = function (
        provider: any,
        collection: Map<any, any>,
        enhancerSubtype?: unknown,
      ) {
        const moduleRef = this as { metatype?: { name?: string } };
        const result = originalAddCustomProvider.call(this, provider, collection, enhancerSubtype);

        if (provider?.provide) {
          const token = provider.provide;
          const wrapper = typeof collection?.get === "function" ? collection.get(token) : undefined;

          if (!wrapper) {
            diagnosticsLogger.error(
              `Provider ${String(token)} non enregistré dans ${moduleRef?.metatype?.name ?? "UnknownModule"}`,
            );
          } else if (!("metatype" in wrapper) && !("instance" in wrapper)) {
            diagnosticsLogger.error(
              `Provider ${String(token)} sans metatype/instance dans ${moduleRef?.metatype?.name ?? "UnknownModule"}`,
              JSON.stringify(provider),
            );
          }
        }
        return result;
      };
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    Logger.warn(`Impossible d’attacher les diagnostics: ${reason}`, "ProviderDiagnostics");
  }
}
