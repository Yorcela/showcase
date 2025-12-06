import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";

import { PassportModule } from "@nestjs/passport";
import { OrmModule } from "@infrastructure/orm/orm.module";
import { UserModule } from "@modules/user/user.module";

import { AppConfig } from "@shared/modules/config/app.config";
import { CoreConfigModule } from "@shared/modules/config/config.module";
import { EmailModule } from "@shared/modules/email/email.module";

import { FrontUrlBuilderService } from "@utils/front-url-template.utils";
import { AccountVerificationService } from "./application/services/account-verification.service";
import { AuthTokenService } from "./application/services/auth-tokens.service";
import { AuthEmailService } from "./application/services/email.service";
import { AuthUseCase } from "./application/usecases/auth.usecase";
import { RegistrationUseCase } from "./application/usecases/register.usecase";
import { OtpGeneratorService } from "./domain/services/otp-generator.service";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { AuthController } from "./interfaces/http/auth.controller";
import { RegistrationController } from "./interfaces/http/register.controller";

@Module({
  controllers: [RegistrationController, AuthController],
  imports: [
    // CORE
    OrmModule,
    CoreConfigModule,
    // BUSINESS
    UserModule,
    EmailModule,
    // SECURITY
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    JwtModule.registerAsync({
      imports: [CoreConfigModule],
      inject: [AppConfig],
      useFactory: (appConfig: AppConfig): JwtModuleOptions => ({
        secret: appConfig.getJwtSecret(),
        signOptions: { expiresIn: appConfig.getJwtAccessExpiresInMinutes() },
      }),
    }),
  ],
  providers: [
    // USE CASES
    RegistrationUseCase,
    AuthUseCase,
    // SERVICES
    AuthTokenService,
    AuthEmailService,
    AccountVerificationService,
    OtpGeneratorService,
    FrontUrlBuilderService,
    JwtStrategy,
  ],
  exports: [AuthTokenService, JwtStrategy],
})
export class AuthModule {}
