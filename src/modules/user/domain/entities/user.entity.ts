import { PasswordHashPort } from "@ports/security/password-hash.port";
import { AbstractAppEntity, StaticEntity } from "@shared/core/abstract/entity.abstract";
import { Cuid2 } from "@apptypes/cuid2.type";

export type UserRawForCreate = {
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type UserRaw = {
  id: Cuid2;
  email: string;
  passwordHash: string;
  status: UserStatus;
  role: UserRole;
  phone?: string;
  firstName?: string;
  lastName?: string;
  emailVerifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date | null;
};

@StaticEntity<UserRaw>()
export class UserEntity extends AbstractAppEntity<UserRaw> {
  public readonly id: Cuid2;
  public email: string;
  public passwordHash: string;
  public status: UserStatus;
  public role: UserRole;
  public phone?: string;
  public firstName?: string;
  public lastName?: string;
  public emailVerifiedAt?: Date | null;
  public readonly createdAt?: Date;
  public updatedAt?: Date;
  public lastLoginAt?: Date | null;

  constructor(params: {
    id: Cuid2;
    email: string;
    passwordHash: string;
    status: UserStatus;
    role: UserRole;
    phone?: string;
    firstName?: string;
    lastName?: string;
    emailVerifiedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    lastLoginAt?: Date | null;
  }) {
    super();
    this.id = params.id;
    this.email = params.email.toLowerCase();
    this.passwordHash = params.passwordHash;
    this.status = params.status;
    this.role = params.role;
    this.phone = params.phone;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.emailVerifiedAt = params.emailVerifiedAt ?? null;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.lastLoginAt = params.lastLoginAt ?? null;
  }

  // -------- static helpers

  static fromRaw(raw: UserRaw): UserEntity {
    return new UserEntity({
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      status: raw.status,
      role: raw.role,
      phone: raw.phone,
      firstName: raw.firstName,
      lastName: raw.lastName,
      emailVerifiedAt: raw.emailVerifiedAt ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      lastLoginAt: raw.lastLoginAt ?? null,
    });
  }

  static toRaw(entity: UserEntity): UserRaw {
    return {
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      status: entity.status,
      role: entity.role,
      phone: entity.phone,
      firstName: entity.firstName,
      lastName: entity.lastName,
      emailVerifiedAt: entity.emailVerifiedAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastLoginAt: entity.lastLoginAt ?? null,
    };
  }

  fromRaw(raw: UserRaw): UserEntity {
    return UserEntity.fromRaw(raw);
  }

  toRaw(): UserRaw {
    return UserEntity.toRaw(this);
  }

  // HELPERS

  async comparePassword(password: string, hasher: PasswordHashPort): Promise<boolean> {
    return hasher.compare(this.passwordHash, password);
  }

  login(): void {
    this.lastLoginAt = new Date();
  }

  get fullName(): string {
    const first = this.firstName?.trim() ?? "";
    const last = this.lastName ? this.lastName.trim().toUpperCase() : "";
    return [first, last].filter(Boolean).join(" ");
  }

  get isPendingVerification(): boolean {
    return this.status === UserStatus.PENDING_VERIFICATION;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
    this.emailVerifiedAt = new Date();
    this.login();
  }

  get isSuspended(): boolean {
    return this.status === UserStatus.SUSPENDED;
  }

  get isBanned(): boolean {
    return this.status === UserStatus.BANNED;
  }

  get isDeleted(): boolean {
    return this.status === UserStatus.SOFT_DELETED;
  }

  get isAdmin(): boolean {
    return [UserRole.ADMIN, UserRole.GOD].includes(this.role);
  }
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  GOD = "GOD",
}

export enum UserStatus {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  SOFT_DELETED = "SOFT_DELETED",
}

export function getUserRolesList(): UserRole[] {
  return Object.values(UserRole);
}

export function getUserStatusList(): UserStatus[] {
  return Object.values(UserStatus);
}
