import { Inject } from "@nestjs/common";

import { APP_CONFIG, AppConfig } from "@shared/modules/config/app.config";
import { EmailService } from "@shared/modules/email/email.service";
import { EmailTemplateId, TemplatePayloads } from "@shared/modules/email/registery.template";

import { FrontPageUrls, FrontUrlBuilderService } from "@utils/front-url-template.utils";

import { OtpEntity } from "../../domain/entities/otp.entity";
import { AuthRegisterEmailSendFailedError } from "../../domain/errors/register.error";

export type VerificationEmailParams = {
  email: string;
  otp: OtpEntity;
  lang?: string;
};

const template: EmailTemplateId = "auth/verify-email";
type templateType = TemplatePayloads[typeof template] & { lang?: string };

export class AuthEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly urlBuilder: FrontUrlBuilderService,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  async sendVerificationEmail(params: VerificationEmailParams): Promise<void> {
    const { email, otp, lang } = params;
    const { code, token, expiresAt } = otp;

    const verificationLink = this.urlBuilder.buildFrontUrl(FrontPageUrls.REGISTER_VERIFYEMAIL, {
      token,
      code,
    });
    const otpExpirationTime = Math.max(
      1,
      Math.ceil((expiresAt.getTime() - Date.now()) / 60000),
    ).toString();
    const data: templateType = {
      code,
      verificationLink,
      otpExpirationTime,
      lang: lang ?? this.appConfig.getAppDefaultLanguage(),
    };

    try {
      await this.emailService.send(template, data, email);
    } catch (error) {
      throw new AuthRegisterEmailSendFailedError({ params, error });
    }
  }
}
