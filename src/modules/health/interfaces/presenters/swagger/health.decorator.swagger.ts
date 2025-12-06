// src/modules/health/presenters/swagger/health.decorator.swagger.ts
import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { ValidationOptions } from "class-validator";

import { buildDecorator } from "@shared/presenters/swagger/common.decorator.swagger";

// ---------- STATUT ----------
export const SwaggerHealthStatus = (required = false) =>
  buildDecorator(String, "Statut de l'app", "OK | ERROR", {
    required,
    isInValues: ["ERROR", "OK"],
    isInValidationOptions: {
      message: "Health status must be OK or ERROR",
    } as ValidationOptions,
  });

// ---------- DETAILS ----------
export const SwaggerHealthNodeUptime = (required = false) =>
  buildDecorator(Number, "Uptime du process (secondes)", 123.456, {
    required,
    minimum: 0,
  });

export const SwaggerHealthNodePid = (required = false) =>
  buildDecorator(Number, "PID du process Node", 12345, {
    required,
    minimum: 1,
  });

export const SwaggerHealthNodeVersion = (required = false) =>
  buildDecorator(String, "Version de Node.js", "v20.10.0", { required });

export const SwaggerAppVersion = (required = false) =>
  buildDecorator(String, "Version de l'application", "1.0.0", { required });

export const SwaggerAppEnvironment = (required = false) =>
  buildDecorator(String, "Environnement d'exécution", "development", {
    required,
    isInValues: ["development", "test", "staging", "production"],
    isInValidationOptions: {
      message: "Environment must be one of development|test|staging|production",
    },
  });

export const SwaggerHealthTimestamp = (required = false) =>
  buildDecorator(String, "Horodatage ISO", new Date().toISOString(), { required });

export const SwaggerHealthResponseTime = (required = false) =>
  buildDecorator(Number, "Temps de réponse (ms)", 42, {
    required,
    minimum: 0,
  });

// ---------- OBJETS LIBRES (checks / info) ----------
export const SwaggerHealthInfoObject = (required = false) =>
  applyDecorators(
    ApiProperty({
      description: "Objet de checks/infos techniques (clé/valeur libre)",
      required,
      example: {
        db: { status: "up", latencyMs: 12 },
        redis: { status: "up" },
      },
      type: Object,
      additionalProperties: true,
    }),
  );
