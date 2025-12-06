import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaUowContext } from "@infrastructure/orm/prisma/prisma-uow.adapter";
import { PrismaService } from "@infrastructure/orm/prisma/prisma.service";

import { AuthLoginUserNotFoundError } from "@modules/auth/domain/errors/login.error";
import { PersistenceAuthRegisterFailedError } from "@modules/auth/domain/errors/register.error";

import { Cuid2 } from "@apptypes/cuid2.type";
import { UserRepoPort, UserSearchParams } from "../../application/ports/user.repo.port";
import { UserEntity, UserRaw, UserRawForCreate } from "../../domain/entities/user.entity";

const UserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  status: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} as const satisfies Prisma.UserSelect;

@Injectable()
export class PrismaUserRepository implements UserRepoPort {
  constructor(private readonly prismaService: PrismaService) {}

  // READ
  /**
   *
   * @param id
   * @param ctx
   * @returns
   */
  async getById(id: Cuid2, ctx?: PrismaUowContext): Promise<UserEntity | null> {
    const row = await this.prismaService
      .getDb(ctx)
      .user.findUnique({ where: { id }, select: UserSelect });
    return row ? UserEntity.fromRaw(row as UserRaw) : null;
  }

  /**
   *
   * @param email
   * @param ctx
   * @returns
   */
  async findByEmail(email: string, ctx?: PrismaUowContext): Promise<UserEntity | null> {
    const row = await this.prismaService
      .getDb(ctx)
      .user.findUnique({ where: { email }, select: UserSelect });
    return row ? UserEntity.fromRaw(row as UserRaw) : null;
  }

  /**
   * Get User's credentials
   * @param email
   * @param ctx
   * @returns
   */
  async getCredentials(email: string, ctx?: PrismaUowContext): Promise<UserEntity> {
    try {
      const row = await this.prismaService.getDb(ctx).user.findUnique({
        where: { email },
        select: { id: true, email: true, passwordHash: true },
      });
      return UserEntity.fromRaw(row as UserRaw);
    } catch (error) {
      throw new AuthLoginUserNotFoundError({ email, error });
    }
  }

  /**
   *
   * @param param0
   * @param ctx
   * @returns
   */
  async list(params?: UserSearchParams, ctx?: PrismaUowContext): Promise<UserEntity[] | []> {
    const { search, take = 50, skip = 0 } = params ?? {};
    const needle = search?.trim();

    const rows: UserRaw[] = (await this.prismaService.getDb(ctx).user.findMany({
      take,
      skip,
      orderBy: { createdAt: "desc" },
      select: UserSelect,
      where: !search
        ? undefined
        : {
            OR: ["email", "firstName", "lastName"].map((key) => ({
              [key]: { contains: needle, mode: "insensitive" },
            })),
          },
    })) as UserRaw[];
    return rows && rows.length > 0 ? rows.map((r) => UserEntity.fromRaw(r as UserRaw)) : [];
  }

  // WRITE
  // We throw when we cant' write
  /**
   * @param data
   * @param ctx
   * @returns
   */
  async create(data: UserRawForCreate, ctx?: PrismaUowContext): Promise<UserEntity> {
    try {
      return UserEntity.fromRaw(
        (await this.prismaService.getDb(ctx).user.create({
          data: { email: data.email, role: data.role, status: data.status },
          select: UserSelect,
        })) as UserRaw,
      );
    } catch (error) {
      throw new PersistenceAuthRegisterFailedError({ data, error });
    }
  }

  /**
   *
   * @param userEntity
   * @param ctx
   */
  async update(userEntity: UserEntity, ctx?: PrismaUowContext): Promise<void> {
    try {
      const { id, ...data } = userEntity.toRaw();
      await this.prismaService.getDb(ctx).user.update({ data, where: { id } });
    } catch (error) {
      throw new PersistenceAuthRegisterFailedError({ userEntity, error });
    }
  }
}
