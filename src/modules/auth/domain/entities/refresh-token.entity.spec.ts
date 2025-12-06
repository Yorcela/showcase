import { Cuid2 } from "@apptypes/cuid2.type";
import { HashedToken } from "@apptypes/hashed-token.type";

import { RefreshTokenEntity, RefreshTokenRaw } from "./refresh-token.entity";

describe("RefreshTokenEntity", () => {
  const baseDates = {
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T01:00:00.000Z"),
    expiresAt: new Date(Date.now() + 120_000),
  };

  it("should hydrate from raw and keep temporal fields", () => {
    // Given
    const raw: RefreshTokenRaw = {
      id: "rft_123",
      userId: "usr_123",
      sessionId: "ses_123",
      tokenHash: "hash123",
      createdAt: baseDates.createdAt,
      updatedAt: baseDates.updatedAt,
      expiresAt: baseDates.expiresAt,
      revokedAt: null,
      lastUsedAt: null,
    };

    // When
    const entity = RefreshTokenEntity.fromRaw(raw);
    const result = entity.toRaw();

    // Then
    expect(entity.id).toBe(raw.id);
    expect(entity.lastUsedAt).toBeNull();
    expect(result).toEqual(raw);
  });

  it("should flag expiration and revocation status", () => {
    // Given
    const revoked = RefreshTokenEntity.fromRaw({
      id: "rft_revoked",
      userId: "usr_123",
      sessionId: "ses_123",
      tokenHash: "hash123",
      createdAt: baseDates.createdAt,
      updatedAt: baseDates.updatedAt,
      expiresAt: new Date(Date.now() - 1),
      revokedAt: new Date("2024-01-01T02:00:00.000Z"),
      lastUsedAt: new Date("2024-01-01T01:30:00.000Z"),
    } as RefreshTokenRaw);

    // Then
    expect(revoked.isExpired()).toBe(true);
    expect(revoked.isRevoked()).toBe(true);
  });

  it("should update usage markers", () => {
    // Given
    const entity = new RefreshTokenEntity(
      "rft_active" as Cuid2,
      "usr_active" as Cuid2,
      "ses_active" as Cuid2,
      "hash456" as HashedToken,
      baseDates.createdAt,
      baseDates.updatedAt,
      baseDates.expiresAt,
    );
    const previousUpdatedAt = entity.updatedAt;

    // When
    entity.markAsUsed();
    entity.markAsRevoked();

    // Then
    expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    expect(entity.lastUsedAt).not.toBeNull();
    expect(entity.revokedAt).not.toBeNull();
    expect(entity.isRevoked()).toBe(true);
  });
});
