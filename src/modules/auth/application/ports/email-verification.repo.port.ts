import { UowContext } from "@ports/unit-of-work/unit-of-work.port";
import { EmailVerificationEntity } from "../../domain/entities/email-verification.entity";

export interface EmailVerificationRepoPort {
  create(
    input: { userId: string; email: string; code: string; tokenHash: string; expiresAt: Date },
    ctx?: UowContext,
  ): Promise<void>;

  findValidByTokenHash(
    tokenHash: string,
    ctx?: UowContext,
  ): Promise<EmailVerificationEntity | null>;

  consume(token: string, ctx?: UowContext): Promise<void>;
}

export const AUTH_EMAIL_VERIFICATION_REPO_PORT = Symbol("AUTH_EMAIL_VERIFICATION_REPO_PORT");
