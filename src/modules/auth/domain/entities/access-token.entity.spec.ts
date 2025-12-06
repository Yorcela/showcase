import { Cuid2 } from "@apptypes/cuid2.type";

import { AccessTokenEntity, AccessTokenRaw } from "./access-token.entity";

describe("AccessTokenEntity", () => {
  it("should hydrate from raw payload and preserve optional fields", () => {
    // Given
    const raw: AccessTokenRaw = {
      sub: "usr_123",
      sid: "ses_456",
      iat: 1712300000,
    };

    // When
    const entity = AccessTokenEntity.fromRaw(raw);
    const result = entity.toRaw();

    // Then
    expect(entity.sub).toBe(raw.sub);
    expect(entity.sid).toBe(raw.sid);
    expect(result).toEqual(raw);
  });

  it("should omit optional fields when undefined on serialization", () => {
    // Given
    const entity = new AccessTokenEntity("usr_789" as Cuid2, "ses_987" as Cuid2, 1712300000);

    // When
    const raw = entity.toRaw();

    // Then
    expect(raw).toEqual({
      sub: "usr_789",
      sid: "ses_987",
      iat: 1712300000,
    });
  });

  it("should rebuild entity via instance fromRaw", () => {
    const entity = new AccessTokenEntity("usr_432" as Cuid2, "ses_654" as Cuid2, 1);
    const raw: AccessTokenRaw = { sub: "usr_111", sid: "ses_222", iat: 42 };

    const rebuilt = entity.fromRaw(raw);

    expect(rebuilt).toBeInstanceOf(AccessTokenEntity);
    expect(rebuilt.toRaw()).toEqual(raw);
  });
});
