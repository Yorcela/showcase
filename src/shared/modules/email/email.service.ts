import { Inject, Injectable } from "@nestjs/common";

import {
  EMAIL_PROVIDER_PORT,
  EmailOptions,
  EmailProviderPort,
} from "@ports/email-provider/email-provider.port";
import {
  TEMPLATE_RENDERER_PORT,
  TemplateRendererPort,
} from "@ports/template-renderder/template-renderder.port";
import { Dictionnary } from "@apptypes/dictionnary.type";
import { APP_CONFIG, AppConfig } from "../config/app.config";

import type { EmailTemplateId } from "./registery.template";

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_PROVIDER_PORT) private readonly provider: EmailProviderPort,
    @Inject(TEMPLATE_RENDERER_PORT) private readonly renderer: TemplateRendererPort,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  async send<T extends Dictionnary>(template: EmailTemplateId, data: T, to: string): Promise<void> {
    const { html, subject, text } = await this.renderer.render(template, data);
    const options: EmailOptions = {
      to,
      html,
      text,
      subject: `[tallae] ${subject}`,
      from: this.appConfig.getEmailFrom(),
    };
    await this.provider.send(options);
  }
}
