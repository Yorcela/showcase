import { Global, Module } from "@nestjs/common";

import { TEMPLATE_RENDERER_PORT } from "@ports/template-renderder/template-renderder.port";

import { EmailTemplateHandlebarsRenderer } from "./handlebars/handlebars.adapter";

@Global()
@Module({
  providers: [{ provide: TEMPLATE_RENDERER_PORT, useClass: EmailTemplateHandlebarsRenderer }],
  exports: [TEMPLATE_RENDERER_PORT],
})
export class TemplateRendererModule {}

//todo : rendre dynamique l'inclusion du provider selon la conf
