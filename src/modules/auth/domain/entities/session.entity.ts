import { AbstractAppEntity, StaticEntity } from "@shared/core/abstract/entity.abstract";
import { Cuid2 } from "@apptypes/cuid2.type";

export type SessionRaw = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  revokedAt?: Date | null;
};

@StaticEntity<SessionRaw>()
export class SessionEntity extends AbstractAppEntity<SessionRaw> {
  constructor(
    public readonly id: Cuid2,
    public readonly userId: Cuid2,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly expiresAt: Date,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public revokedAt?: Date | null,
  ) {
    super();
  }

  static fromRaw(raw: SessionRaw): SessionEntity {
    return new SessionEntity(
      raw.id as Cuid2,
      raw.userId as Cuid2,
      new Date(raw.createdAt),
      new Date(raw.updatedAt),
      new Date(raw.expiresAt),
      raw.ipAddress,
      raw.userAgent,
      raw.revokedAt ? new Date(raw.revokedAt) : null,
    );
  }

  static toRaw(entity: SessionEntity): SessionRaw {
    return {
      id: entity.id as string,
      userId: entity.userId as string,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      expiresAt: entity.expiresAt,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      revokedAt: entity.revokedAt ?? null,
    };
  }

  fromRaw(raw: SessionRaw): SessionEntity {
    return SessionEntity.fromRaw(raw);
  }

  toRaw(): SessionRaw {
    return SessionEntity.toRaw(this);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return !!this.revokedAt;
  }

  markAsUsed(): SessionEntity {
    const date = new Date();
    this.updatedAt = date;
    return this;
  }

  markAsRevoked(): SessionEntity {
    const date = new Date();
    this.revokedAt = date;
    return this;
  }
}
