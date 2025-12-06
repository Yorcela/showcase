import { Inject, Injectable } from "@nestjs/common";

import {
  UNIT_OF_WORK_PORT,
  UnitOfWorkPort,
  UowContext,
} from "@ports/unit-of-work/unit-of-work.port";

import { UserService } from "@modules/user/application/services/user.service";

import { SecuredToken } from "@apptypes/secured-token.type";
import { EmailVerificationEntity } from "../../domain/entities/email-verification.entity";
import {
  AuthRegisterVerificatioCodeInvalidnError,
  AuthRegisterVerificationAlreadyVerifiedError,
  AuthRegisterVerificationNotPendingVerificationError,
} from "../../domain/errors/register.error";
import {
  AuthRegisterInputDto,
  AuthVerifyEmailInputDto,
} from "../../interfaces/presenters/dto/register.dto";
import { AccountVerificationService } from "../services/account-verification.service";
import { AuthEmailService } from "../services/email.service";

@Injectable()
export class RegistrationUseCase {
  constructor(
    @Inject(UNIT_OF_WORK_PORT) private readonly uow: UnitOfWorkPort,
    private readonly userService: UserService,
    private readonly accountVerificationService: AccountVerificationService,
    private readonly emailService: AuthEmailService,
  ) {}

  async registerEmail(
    input: AuthRegisterInputDto,
  ): Promise<{ email: string; verificationToken: SecuredToken | null; expiresAt: Date | null }> {
    return this.uow.runInTransaction(async (ctx: UowContext) => {
      const { email } = input;
      const user = await this.userService.findOrCreate(email, ctx);
      if (user.isActive) throw new AuthRegisterVerificationAlreadyVerifiedError({ user });

      let verificationToken: SecuredToken | null = null;
      let expiresAt: Date | null = null;
      if (user.isPendingVerification) {
        const otp = await this.accountVerificationService.createForUser(user.id, email, ctx);
        await this.emailService.sendVerificationEmail({ email, otp });
        verificationToken = otp.token;
        expiresAt = otp.expiresAt;
      }

      return { email: user.email, verificationToken, expiresAt };
    });
  }

  async verifyEmail(input: AuthVerifyEmailInputDto): Promise<EmailVerificationEntity> {
    return this.uow.runInTransaction(async (ctx: UowContext) => {
      const { verificationToken, code, email } = input;
      const token = await this.accountVerificationService.getFromToken(
        verificationToken as SecuredToken,
        ctx,
      );

      const isValid = token.isValid(code, email);
      if (!isValid) throw new AuthRegisterVerificatioCodeInvalidnError({ input });

      const user = await this.userService.findOrCreate(email, ctx);
      if (!user.isPendingVerification)
        throw new AuthRegisterVerificationNotPendingVerificationError({ user });
      await this.userService.activate(user, ctx);

      await this.accountVerificationService.consumeToken(verificationToken as SecuredToken, ctx);

      return token;
    });
  }
}
