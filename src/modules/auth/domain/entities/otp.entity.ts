import { SecuredToken } from "@apptypes/secured-token.type";

export class OtpEntity {
  constructor(
    public readonly code: string,
    public readonly token: SecuredToken,
    public readonly expiresAt: Date,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
