import { UserEntity, UserRole, UserStatus } from "@modules/user/domain/entities/user.entity";
import {
  SwaggerUserEmail,
  SwaggerUserCreatedAt,
  SwaggerUserEmailVerifiedAt,
  SwaggerUserFirstName,
  SwaggerUserId,
  SwaggerUserLastName,
  SwaggerUserRole,
  SwaggerUserStatus,
  SwaggerUserHasPassword,
} from "@modules/user/presenters/swagger/user.decorator.swagger";

import { Cuid2 } from "@apptypes/cuid2.type";

export interface UserResponsePayloadProps {
  userId: Cuid2;
  email: string;
  hasPassword: boolean;
  status: UserStatus;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  emailVerifiedAt?: Date;
  createdAt?: Date;
}

export class UserResponsePayloadDto {
  @SwaggerUserId() userId!: Cuid2;
  @SwaggerUserEmail() email!: string;
  @SwaggerUserHasPassword() hasPassword!: boolean;
  @SwaggerUserStatus() status!: UserStatus;
  @SwaggerUserRole() role!: UserRole;
  @SwaggerUserFirstName() firstName?: string;
  @SwaggerUserLastName() lastName?: string;
  @SwaggerUserEmailVerifiedAt() emailVerifiedAt?: Date;
  @SwaggerUserCreatedAt() createdAt?: Date;

  constructor(props: UserResponsePayloadProps) {
    Object.assign(this, props);
  }

  static fromEntity(u: UserEntity): UserResponsePayloadDto {
    return new UserResponsePayloadDto({
      userId: u.id,
      email: u.email,
      hasPassword: !!u.passwordHash,
      status: u.status,
      role: u.role,
      firstName: u.firstName ?? undefined,
      lastName: u.lastName ?? undefined,
      emailVerifiedAt: u.emailVerifiedAt ?? undefined,
      createdAt: u.createdAt ?? undefined,
    });
  }
}
