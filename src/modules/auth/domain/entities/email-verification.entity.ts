import { Cuid2 } from "@apptypes/cuid2.type";
import { HashedToken } from "@apptypes/hashed-token.type";
export class EmailVerificationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: Cuid2,
    public readonly email: string,
    public readonly code: string,
    public readonly token: HashedToken,
    public readonly expiresAt: Date,
    public readonly verifiedAt?: Date | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static fromRaw(p: {
    id: string;
    userId: string;
    email: string;
    code: string;
    token: string;
    expiresAt: Date;
    verifiedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): EmailVerificationEntity {
    return new EmailVerificationEntity(
      p.id,
      p.userId as Cuid2,
      p.email,
      p.code,
      p.token as HashedToken,
      p.expiresAt,
      p.verifiedAt,
      p.createdAt,
      p.updatedAt,
    );
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isVerified(): boolean {
    return this.verifiedAt !== null;
  }

  isValid(code: string, email: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    return (
      this.code === code &&
      this.email === normalizedEmail &&
      !this.isExpired() &&
      !this.isVerified()
    );
  }

  markAsVerified(): EmailVerificationEntity {
    return new EmailVerificationEntity(
      this.id,
      this.userId,
      this.email,
      this.code,
      this.token,
      this.expiresAt,
      new Date(),
      this.createdAt,
      this.updatedAt,
    );
  }
}
