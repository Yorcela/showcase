import { Inject, Injectable } from "@nestjs/common";

import { UowContext } from "@ports/unit-of-work/unit-of-work.port";

import { AbstractService } from "@shared/core/abstract/service.abstract";

import { SecuredToken } from "@apptypes/secured-token.type";
import { EmailVerificationEntity } from "../../domain/entities/email-verification.entity";
import { OtpEntity } from "../../domain/entities/otp.entity";
import {
  AuthPersistenceFailureError,
  AuthRegisterVerificationCodeInvalidOrExpiredError,
} from "../../domain/errors/register.error";
import { OtpGeneratorService } from "../../domain/services/otp-generator.service";
import {
  AUTH_EMAIL_VERIFICATION_REPO_PORT,
  EmailVerificationRepoPort,
} from "../ports/email-verification.repo.port";

@Injectable()
export class AccountVerificationService extends AbstractService {
  constructor(
    @Inject(AUTH_EMAIL_VERIFICATION_REPO_PORT) private readonly repo: EmailVerificationRepoPort,
    private readonly generatorService: OtpGeneratorService,
  ) {
    super();
  }

  async createForUser(userId: string, email: string, ctx?: UowContext): Promise<OtpEntity> {
    const { code, token, tokenHash, expiresAt } = this.generatorService.generateFullOtpCode();
    try {
      await this.repo.create(
        { userId, email: email.toLowerCase(), code, tokenHash, expiresAt },
        ctx,
      );
      return new OtpEntity(code, token, expiresAt);
    } catch (error) {
      throw new AuthPersistenceFailureError({
        userId,
        email,
        error: { error, query: { userId, email: email.toLowerCase(), code, tokenHash, expiresAt } },
      });
    }
  }

  async getFromToken(token: SecuredToken, ctx?: UowContext): Promise<EmailVerificationEntity> {
    const verifToken = await this.repo.findValidByTokenHash(
      this.generatorService.getHashedToken(token),
      ctx,
    );
    if (!verifToken) throw new AuthRegisterVerificationCodeInvalidOrExpiredError({ token });
    return verifToken;
  }

  async consumeToken(token: SecuredToken, ctx?: UowContext): Promise<void> {
    try {
      await this.repo.consume(this.generatorService.getHashedToken(token), ctx);
    } catch (error) {
      throw new AuthPersistenceFailureError({ token, error });
    }
  }
}
