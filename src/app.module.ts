import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { EmailProviderModule } from "@infrastructure/email-provider/email-provider.module";
import { OrmModule } from "@infrastructure/orm/orm.module";
import { SecurityModule } from "@infrastructure/security/security.module";
import { TemplateRendererModule } from "@infrastructure/template-renderer/template-renderer.module";

import { AuthModule } from "@modules/auth/auth.module";
import { HealthModule } from "@modules/health/health.module";
import { UserModule } from "@modules/user/user.module";
import { CoreConfigModule } from "@shared/modules/config/config.module";
import { EmailModule } from "@shared/modules/email/email.module";
import { SanitizeModule } from "@shared/modules/sanitizer/sanitize.module";
import { ValidatorModule } from "@shared/validators/validator.module";

@Module({
  imports: [
    // SECURITY
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60, limit: 60 },
      { name: "auth", ttl: 60, limit: 5 },
      { name: "health", ttl: 60, limit: 20 },
      { name: "public", ttl: 60, limit: 100 },
    ]),

    // GLOBAL CONFIG
    CoreConfigModule,
    ValidatorModule,
    SanitizeModule,
    SecurityModule,

    // PORTS
    OrmModule,
    EmailProviderModule,
    TemplateRendererModule,

    // FEATURES
    AuthModule,
    UserModule,
    HealthModule,

    // SHARED
    EmailModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
