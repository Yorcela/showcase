import { Module } from "@nestjs/common";

import { EMAIL_PROVIDER_PORT } from "@ports/email-provider/email-provider.port";
import { TEMPLATE_RENDERER_PORT } from "@ports/template-renderder/template-renderder.port";

import { EmailMailhogAdapter } from "@infrastructure/email-provider/mailhog/mailhog.adapter";
import { EmailTemplateHandlebarsRenderer } from "@infrastructure/template-renderer/handlebars/handlebars.adapter";

import { EmailService } from "./email.service";
import { AppConfig, APP_CONFIG } from "../config/app.config";
import { CoreConfigModule } from "../config/config.module";

@Module({
  imports: [CoreConfigModule],
  providers: [
    EmailService,
    {
      provide: EMAIL_PROVIDER_PORT,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => {
        const provider = (config.getEmailProvider() ?? "").toLowerCase();
        switch (provider) {
          case "mailhog":
          default:
            return new EmailMailhogAdapter(config);
        }
      },
    },
    {
      provide: TEMPLATE_RENDERER_PORT,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => {
        const renderer = (config.getEmailRenderer() ?? "").toLowerCase();
        switch (renderer) {
          case "handlebars":
          default:
            return new EmailTemplateHandlebarsRenderer(config);
        }
      },
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
