import { Cuid2 } from "@apptypes/cuid2.type";
import { HashedToken } from "@apptypes/hashed-token.type";

import { EmailVerificationEntity } from "./email-verification.entity";

describe("EmailVerificationEntity", () => {
  const base = {
    id: "verif_123",
    userId: "usr_123" as Cuid2,
    email: "user@example.com",
    code: "123456",
    token: "hash123" as HashedToken,
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:05:00.000Z"),
  };

  it("should hydrate from raw payload", () => {
    // Given
    const raw = {
      ...base,
      verifiedAt: null,
    };

    // When
    const entity = EmailVerificationEntity.fromRaw(raw);

    // Then
    expect(entity.id).toBe(raw.id);
    expect(entity.email).toBe(raw.email);
    expect(entity.verifiedAt).toBeNull();
  });

  it("should detect expiration and verification", () => {
    const expired = new EmailVerificationEntity(
      base.id,
      base.userId,
      base.email,
      base.code,
      base.token,
      new Date(Date.now() - 1),
      null,
    );
    const verified = new EmailVerificationEntity(
      base.id,
      base.userId,
      base.email,
      base.code,
      base.token,
      base.expiresAt,
      new Date(),
    );

    expect(expired.isExpired()).toBe(true);
    expect(expired.isVerified()).toBe(false);
    expect(verified.isExpired()).toBe(false);
    expect(verified.isVerified()).toBe(true);
  });

  it("should validate using trimmed lowercase email", () => {
    const entity = new EmailVerificationEntity(
      base.id,
      base.userId,
      base.email,
      base.code,
      base.token,
      base.expiresAt,
      null,
    );

    expect(entity.isValid("123456", " USER@Example.com ")).toBe(true);
    expect(entity.isValid("wrong", "user@example.com")).toBe(false);
    expect(entity.isValid("123456", "other@example.com")).toBe(false);
  });

  it("should return new instance when marked as verified", () => {
    const entity = new EmailVerificationEntity(
      base.id,
      base.userId,
      base.email,
      base.code,
      base.token,
      base.expiresAt,
      null,
    );

    const verified = entity.markAsVerified();

    expect(verified).not.toBe(entity);
    expect(verified.isVerified()).toBe(true);
    expect(entity.isVerified()).toBe(false);
  });
});
