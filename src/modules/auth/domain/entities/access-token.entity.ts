import { AbstractAppEntity, StaticEntity } from "@shared/core/abstract/entity.abstract";
import { Cuid2 } from "@apptypes/cuid2.type";

export type AccessTokenRaw = {
  sub: string;
  sid: string;
  iat: number;
};

@StaticEntity<AccessTokenRaw>()
export class AccessTokenEntity extends AbstractAppEntity<AccessTokenRaw> {
  constructor(
    public readonly sub: Cuid2, // userId
    public readonly sid: Cuid2, // sessionId
    public readonly iat: number, // generation time timestamp (issuedAt)
  ) {
    super();
  }

  static fromRaw(raw: AccessTokenRaw): AccessTokenEntity {
    return new AccessTokenEntity(raw.sub as Cuid2, raw.sid as Cuid2, raw.iat);
  }

  static toRaw(entity: AccessTokenEntity): AccessTokenRaw {
    return {
      sub: entity.sub as string,
      sid: entity.sid as string,
      iat: entity.iat,
    };
  }

  fromRaw(raw: AccessTokenRaw): AccessTokenEntity {
    return AccessTokenEntity.fromRaw(raw);
  }
  toRaw(): AccessTokenRaw {
    return AccessTokenEntity.toRaw(this);
  }
}
