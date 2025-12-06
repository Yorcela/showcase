import { Inject, Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

import { EmailProviderPort, EmailOptions } from "@ports/email-provider/email-provider.port";

import { AbstractService } from "@shared/core/abstract/service.abstract";
import { APP_CONFIG, AppConfig } from "@shared/modules/config/app.config";

import { MailHogSendEmailFailureError, MailHogUnknownTransporterError } from "./mailhog.error";

@Injectable()
export class EmailMailhogAdapter extends AbstractService implements EmailProviderPort {
  private readonly transporter: Transporter;

  constructor(@Inject(APP_CONFIG) private readonly appConfig: AppConfig) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.appConfig.getMailhogHost(),
      port: this.appConfig.getMailhogPort(),
      secure: false,
      ignoreTLS: true,
    });
  }

  async send(email: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: email?.from ?? this.appConfig.getEmailFrom(),
        to: Array.isArray(email.to) ? email.to.join(", ") : email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        cc: email.cc?.join(", "),
        bcc: email.bcc?.join(", "),
        replyTo: email.replyTo,
      });
      this.logger.log("EmailMailhogAdapter: email sent successfully");
    } catch (error) {
      if (error instanceof Error) {
        throw new MailHogSendEmailFailureError({ email, error });
      } else {
        throw new MailHogUnknownTransporterError({ email, error });
      }
    }
  }
}
