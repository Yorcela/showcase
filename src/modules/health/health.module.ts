import { Module } from "@nestjs/common";

import { OrmModule } from "@infrastructure/orm/orm.module";
import { CoreConfigModule } from "@shared/modules/config/config.module";
import { HealthService } from "./infrastructure/health.service";
import { HealthController } from "./interfaces/http/health.controller";

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  imports: [CoreConfigModule, OrmModule],
  exports: [CoreConfigModule, OrmModule],
})
export class HealthModule {}
