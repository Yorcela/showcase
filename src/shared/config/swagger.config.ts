import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

/**
 * Configuration Swagger/OpenAPI pour l'API tallae
 * Génère la documentation automatique et les endpoints /docs et /docs-json
 */
export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");
  const isSwaggerEnabled = configService.get<boolean>("SWAGGER_ENABLED", true);
  const swaggerPath = configService.get<string>("SWAGGER_PATH", "docs");
  const appName = configService.get<string>("APP_NAME", "tallae");
  const appVersion = configService.get<string>("APP_VERSION", "1.0.0");
  const frontUrl = configService.get<string>("FRONTEND_URL", "https://www.tallae.app");
  const appUrl = configService.get<string>("APP_URL");
  if (!appUrl) {
    throw new Error("APP_URL environment variable is required");
  }

  if (!isSwaggerEnabled) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle(`${appName} API`)
    .setDescription("")
    .setVersion(appVersion)
    .setContact("tallae Team", frontUrl, "contact@tallae.app")
    .setLicense("Propriétaire", `${frontUrl}`)
    .addServer(appUrl, `Serveur de ${nodeEnv}`)
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Token JWT obtenu via /auth/login",
        in: "header",
      },
      "JWT-auth",
    )
    .addApiKey(
      {
        type: "apiKey",
        name: "X-API-Key",
        in: "header",
        description: "Clé API pour les intégrations externes",
      },
      "API-Key",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return `${controllerKey}_${methodKey}`;
    },
    deepScanRoutes: true,
  });

  // Configuration des options Swagger UI
  const swaggerOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        // Ajouter des headers par défaut si nécessaire
        req.headers["Accept-Language"] = "fr-FR,fr;q=0.9,en;q=0.8";
        return req;
      },
    },
    customSiteTitle: `${appName} API Documentation`,
    customfavIcon: "",
    customJs: [],
    customCssUrl: ["/swagger.css"],
  };

  // Setup Swagger UI sur le path configuré
  SwaggerModule.setup(swaggerPath, app, document, swaggerOptions);

  // Endpoint pour récupérer le JSON OpenAPI
  app.getHttpAdapter().get(`/${swaggerPath}-json`, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(document);
  });

  // Swagger UI initialized successfully
}

/**
 * Configuration des options par défaut pour les décorateurs Swagger
 */
export const DEFAULT_API_RESPONSE_OPTIONS = {
  400: {
    description: "Requête invalide - Erreur de validation",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: {
          oneOf: [
            { type: "string", example: "Validation failed" },
            {
              type: "array",
              items: { type: "string" },
              example: ["email must be a valid email", "password is too weak"],
            },
          ],
        },
        error: { type: "string", example: "Bad Request" },
      },
    },
  },
  401: {
    description: "Non authentifié - Token manquant ou invalide",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Unauthorized" },
      },
    },
  },
  403: {
    description: "Accès interdit - Permissions insuffisantes",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 403 },
        message: { type: "string", example: "Forbidden resource" },
      },
    },
  },
  404: {
    description: "Ressource non trouvée",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        message: { type: "string", example: "Resource not found" },
      },
    },
  },
  429: {
    description: "Trop de requêtes - Rate limit dépassé",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 429 },
        message: { type: "string", example: "Too Many Requests" },
      },
    },
  },
  500: {
    description: "Erreur interne du serveur",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 500 },
        message: { type: "string", example: "Internal server error" },
      },
    },
  },
};
