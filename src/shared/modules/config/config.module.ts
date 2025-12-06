import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as dotenvFlow from "dotenv-flow";

import { APP_CONFIG, AppConfig } from "./app.config";

dotenvFlow.config({ node_env: process.env.NODE_ENV });

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      ignoreEnvFile: true,
    }),
  ],
  providers: [AppConfig, { provide: APP_CONFIG, useClass: AppConfig }],
  exports: [AppConfig, APP_CONFIG],
})
export class CoreConfigModule {}
