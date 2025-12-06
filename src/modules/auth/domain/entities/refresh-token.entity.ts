import { AbstractAppEntity, StaticEntity } from "@shared/core/abstract/entity.abstract";
import { Cuid2 } from "@apptypes/cuid2.type";
import { HashedToken } from "@apptypes/hashed-token.type";

export type RefreshTokenRaw = {
  id: string;
  userId: string;
  sessionId: string;
  tokenHash: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
  lastUsedAt?: Date | null;
};

@StaticEntity<RefreshTokenRaw>()
export class RefreshTokenEntity extends AbstractAppEntity<RefreshTokenRaw> {
  constructor(
    public readonly id: Cuid2,
    public readonly userId: Cuid2,
    public readonly sessionId: Cuid2,
    public readonly tokenHash: HashedToken,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly expiresAt: Date,
    public revokedAt?: Date | null,
    public lastUsedAt?: Date | null,
  ) {
    super();
  }

  static fromRaw(raw: RefreshTokenRaw): RefreshTokenEntity {
    return new RefreshTokenEntity(
      raw.id as Cuid2,
      raw.userId as Cuid2,
      raw.sessionId as Cuid2,
      raw.tokenHash as HashedToken,
      new Date(raw.createdAt),
      new Date(raw.updatedAt),
      new Date(raw.expiresAt),
      raw.revokedAt ? new Date(raw.revokedAt) : null,
      raw.lastUsedAt ? new Date(raw.lastUsedAt) : null,
    );
  }

  static toRaw(entity: RefreshTokenEntity): RefreshTokenRaw {
    return {
      id: entity.id as string,
      userId: entity.userId as string,
      sessionId: entity.sessionId as string,
      tokenHash: entity.tokenHash as string,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt ?? null,
      lastUsedAt: entity.lastUsedAt ?? null,
    };
  }

  fromRaw(raw: RefreshTokenRaw): RefreshTokenEntity {
    return RefreshTokenEntity.fromRaw(raw);
  }

  toRaw(): RefreshTokenRaw {
    return RefreshTokenEntity.toRaw(this);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return !!this.revokedAt;
  }

  markAsUsed(): RefreshTokenEntity {
    const date = new Date();
    this.updatedAt = date;
    this.lastUsedAt = date;
    return this;
  }

  markAsRevoked(): RefreshTokenEntity {
    const date = new Date();
    this.revokedAt = date;
    return this;
  }
}
