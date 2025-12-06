import { Cuid2 } from "@apptypes/cuid2.type";
import { JwtToken } from "@apptypes/jwt.type";

import { SecuredToken } from "@apptypes/secured-token.type";
import { AuthEntity, AuthRaw } from "./auth.entity";

const buildEntity = () => {
  const accessToken = "access-token" as JwtToken;
  const refreshToken = "refresh-token" as SecuredToken;
  const sessionId = "session-id" as Cuid2;
  const refreshTokenExpiresAt = 1_800_000_000;

  const entity = new AuthEntity(accessToken, refreshToken, sessionId, refreshTokenExpiresAt);

  return {
    entity,
    accessToken,
    refreshToken,
    sessionId,
    refreshTokenExpiresAt,
  };
};

describe("AuthEntity", () => {
  it("should expose all token properties", () => {
    const { entity, accessToken, refreshToken, sessionId, refreshTokenExpiresAt } = buildEntity();

    expect(entity.accessToken).toBe(accessToken);
    expect(entity.refreshToken).toBe(refreshToken);
    expect(entity.sessionId).toBe(sessionId);
    expect(entity.refreshTokenExpiresAt).toBe(refreshTokenExpiresAt);
  });

  it("should round-trip with toRaw/fromRaw helpers", () => {
    const { entity } = buildEntity();

    const raw = entity.toRaw();
    expect(raw).toMatchObject<AuthRaw>({
      accessToken: entity.accessToken,
      refreshToken: entity.refreshToken,
      sessionId: entity.sessionId,
      refreshTokenExpiresAt: entity.refreshTokenExpiresAt,
    });

    const rebuilt = AuthEntity.fromRaw(raw);
    expect(rebuilt).toBeInstanceOf(AuthEntity);
    expect(rebuilt.toRaw()).toEqual(raw);
  });

  it("should allow instance fromRaw to rebuild payload", () => {
    const { entity } = buildEntity();
    const raw: AuthRaw = {
      accessToken: "another-access",
      refreshToken: "another-refresh",
      sessionId: "session" as Cuid2,
      refreshTokenExpiresAt: 99,
    };

    const rebuilt = entity.fromRaw(raw);

    expect(rebuilt.accessToken).toBe("another-access");
    expect(rebuilt.refreshTokenExpiresAt).toBe(99);
  });
});
