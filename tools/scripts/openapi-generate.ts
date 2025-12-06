// tools/openapi/generate-openapi.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Global crash handlers for clearer messages
process.on('unhandledRejection', (e) => {
  console.error('🚨 unhandledRejection:', e instanceof Error ? e.stack : e);
  process.exit(1);
});
process.on('uncaughtException', (e) => {
  console.error('🚨 uncaughtException:', e.stack || e);
  process.exit(1);
});

async function generateOpenApiSpec() {
  const outDir = join(process.cwd(), 'tools', 'openapi');
  mkdirSync(outDir, { recursive: true });
  const outJson = join(outDir, 'openapi.v1.json');

  console.log(`🚀 Generating OpenAPI file : ${outJson}`);

  try {
    // Flag docs mode so AppModule can skip optional infra
    process.env.DOCS = '1';

    // Dynamic import (so we can catch errors before NestFactory.create)
    const { AppModule } = await import('../../src/app.module');
    const { AppConfig } = await import('../../src/shared/modules/config/app.config');

    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    const appConfig = app.get(AppConfig);

    const cfg = new DocumentBuilder()
      .setTitle(appConfig.getAppName())
      .setDescription('REST API for yorcela')
      .setVersion(appConfig.getAppVersion())
      .addServer(appConfig.getAppUrl(), `${appConfig.getNodeEnv().toUpperCase()} server`)
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'JWT-auth')
      .addTag('health', "Api Health")
      .build();

    const openapiDoc = SwaggerModule.createDocument(app, cfg, {
      deepScanRoutes: true,
      operationIdFactory: (c, m) => `${c}_${m}`,
    });

    writeFileSync(outJson, JSON.stringify(openapiDoc, null, 2), 'utf8');
    console.log(`✅ OpenAPI JSON: ${outJson}`);
    console.log(
      `📊 Endpoints: ${Object.keys(openapiDoc.paths || {}).length} | Tags: ${(openapiDoc.tags || [])
        .map((t: any) => t.name)
        .join(', ')}`,
    );

    if (process.argv.includes('--yaml')) {
      const yaml = require('js-yaml');
      const outYaml = join(outDir, 'openapi.v1.yaml');
      writeFileSync(outYaml, yaml.dump(openapiDoc, { indent: 2 }), 'utf8');
      console.log(`✅ OpenAPI YAML: ${outYaml}`);
    }

    await app.close();
    console.log('🎉 Generation completed successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error generating OpenAPI file:');
    console.error(err?.stack || err);
    process.exit(1);
  }
}

if (require.main === module) generateOpenApiSpec();
export { generateOpenApiSpec };