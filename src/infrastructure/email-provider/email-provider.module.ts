import { Global, Module } from "@nestjs/common";

import { EMAIL_PROVIDER_PORT } from "@ports/email-provider/email-provider.port";

import { EmailMailhogAdapter } from "./mailhog/mailhog.adapter";

@Global()
@Module({
  providers: [{ provide: EMAIL_PROVIDER_PORT, useClass: EmailMailhogAdapter }],
  exports: [EMAIL_PROVIDER_PORT],
})
export class EmailProviderModule {}

//todo : rendre dynamique l'inclusion du provider selon la conf
