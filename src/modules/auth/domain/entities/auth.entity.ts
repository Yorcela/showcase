import { AbstractAppEntity, StaticEntity } from "@shared/core/abstract/entity.abstract";
import { Cuid2 } from "@apptypes/cuid2.type";
import { JwtToken } from "@apptypes/jwt.type";
import { SecuredToken } from "@apptypes/secured-token.type";

export type AuthRaw = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  refreshTokenExpiresAt: number;
};

@StaticEntity<AuthRaw>()
export class AuthEntity extends AbstractAppEntity<AuthRaw> {
  constructor(
    public readonly accessToken: JwtToken,
    public readonly refreshToken: SecuredToken,
    public readonly sessionId: Cuid2,
    public readonly refreshTokenExpiresAt: number,
  ) {
    super();
  }

  static fromRaw(raw: AuthRaw): AuthEntity {
    const { accessToken, refreshToken, refreshTokenExpiresAt, sessionId } = raw;
    return new AuthEntity(
      accessToken as JwtToken,
      refreshToken as SecuredToken,
      sessionId as Cuid2,
      refreshTokenExpiresAt,
    );
  }

  static toRaw(entity: AuthEntity): AuthRaw {
    return {
      accessToken: entity.accessToken as string,
      refreshToken: entity.refreshToken as string,
      refreshTokenExpiresAt: entity.refreshTokenExpiresAt,
      sessionId: entity.sessionId as string,
    };
  }

  fromRaw(raw: AuthRaw): AuthEntity {
    return AuthEntity.fromRaw(raw);
  }
  toRaw(): AuthRaw {
    return AuthEntity.toRaw(this);
  }
}
