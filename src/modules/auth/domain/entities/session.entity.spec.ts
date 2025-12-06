import { Cuid2 } from "@apptypes/cuid2.type";

import { SessionEntity, SessionRaw } from "./session.entity";

describe("SessionEntity", () => {
  const baseDates = {
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T01:00:00.000Z"),
    expiresAt: new Date(Date.now() + 60_000),
  };

  it("should convert from and to raw structures", () => {
    // Given
    const raw: SessionRaw = {
      id: "ses_123",
      userId: "usr_456",
      createdAt: baseDates.createdAt,
      updatedAt: baseDates.updatedAt,
      expiresAt: baseDates.expiresAt,
      ipAddress: "192.168.0.1",
      userAgent: "jest",
      revokedAt: null,
    };

    // When
    const entity = SessionEntity.fromRaw(raw);
    const result = entity.toRaw();

    // Then
    expect(entity.id).toBe(raw.id);
    expect(entity.revokedAt).toBeNull();
    expect(result).toEqual(raw);
  });

  it("should detect expiration and revocation states", () => {
    // Given
    const expired = SessionEntity.fromRaw({
      id: "ses_expired",
      userId: "usr_123",
      createdAt: baseDates.createdAt,
      updatedAt: baseDates.updatedAt,
      expiresAt: new Date(Date.now() - 1),
      revokedAt: new Date("2024-01-01T02:00:00.000Z"),
    } as SessionRaw);

    // Then
    expect(expired.isExpired()).toBe(true);
    expect(expired.isRevoked()).toBe(true);
  });

  it("should update timestamps when marked as used or revoked", () => {
    // Given
    const entity = new SessionEntity(
      "ses_active" as Cuid2,
      "usr_active" as Cuid2,
      baseDates.createdAt,
      baseDates.updatedAt,
      baseDates.expiresAt,
    );
    const originalUpdatedAt = entity.updatedAt;

    // When
    entity.markAsUsed();
    entity.markAsRevoked();

    // Then
    expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    expect(entity.revokedAt).not.toBeNull();
    expect(entity.isRevoked()).toBe(true);
  });
});
