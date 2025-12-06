import { Prisma } from "@prisma/client";
import { PrismaService } from "@infrastructure/orm/prisma/prisma.service";

import { AuthLoginUserNotFoundError } from "@modules/auth/domain/errors/login.error";
import { PersistenceAuthRegisterFailedError } from "@modules/auth/domain/errors/register.error";

import { Cuid2 } from "@apptypes/cuid2.type";
import { PrismaUserRepository } from "./user.repository";
import { UserEntity, UserRole, UserStatus } from "../../domain/entities/user.entity";

describe("PrismaUserRepository", () => {
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

  const sampleRow = {
    id: "user-1",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: null,
    role: "USER",
    status: "PENDING_VERIFICATION",
    emailVerifiedAt: null,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-02T00:00:00.000Z"),
    lastLoginAt: null,
  } as const;

  const adminRow = { ...sampleRow, role: "ADMIN" as const };
  const godRow = {
    ...sampleRow,
    id: "user-god",
    role: "GOD" as const,
    email: "god@example.com",
  };
  const suspendedRow = {
    ...sampleRow,
    id: "user-suspended",
    status: "SUSPENDED" as const,
    email: "suspended@example.com",
  };
  const bannedRow = {
    ...sampleRow,
    id: "user-banned",
    status: "BANNED" as const,
    email: "banned@example.com",
  };
  const softDeletedRow = {
    ...sampleRow,
    id: "user-soft",
    status: "SOFT_DELETED" as const,
    email: "soft@example.com",
  };

  const createRepo = () => {
    const db = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    const prismaService = {
      getDb: jest.fn().mockReturnValue(db),
    } as unknown as PrismaService;

    const repo = new PrismaUserRepository(prismaService);
    return { repo, db, prismaService } as const;
  };

  it("should map getById result", async () => {
    // Given
    const { repo, db, prismaService } = createRepo();
    db.user.findUnique.mockResolvedValue(sampleRow);

    // When
    const result = await repo.getById(sampleRow.id as Cuid2);

    // Then
    const expectedEmail = sampleRow.email;
    expect(prismaService.getDb).toHaveBeenCalledWith(undefined);
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: sampleRow.id },
      select: expect.any(Object),
    });
    expect(result?.email).toBe(expectedEmail);
  });

  it("should return null when user not found by id", async () => {
    // Given
    const { repo, db, prismaService } = createRepo();
    db.user.findUnique.mockResolvedValue(null);

    // When
    const result = await repo.getById("missing" as Cuid2);

    // Then
    const expected = null;
    expect(prismaService.getDb).toHaveBeenCalledWith(undefined);
    expect(result).toBe(expected);
  });

  it("should lookup user by email", async () => {
    // Given
    const { repo, db, prismaService } = createRepo();
    db.user.findUnique.mockResolvedValue(sampleRow);

    // When
    const result = await repo.findByEmail(sampleRow.email);

    // Then
    expect(prismaService.getDb).toHaveBeenCalledWith(undefined);
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: sampleRow.email },
      select: expect.any(Object),
    });
    expect(result?.email).toBe(sampleRow.email);
  });

  it("should return null when lookup by email yields nothing", async () => {
    // Given
    const { repo, db, prismaService } = createRepo();
    db.user.findUnique.mockResolvedValue(null);

    // When
    const result = await repo.findByEmail("missing@example.com");

    // Then
    expect(prismaService.getDb).toHaveBeenCalledWith(undefined);
    expect(result).toBeNull();
  });

  it("should list users with search arguments", async () => {
    // Given
    const { repo, db, prismaService } = createRepo();
    const verifiedRow = {
      ...sampleRow,
      id: "user-verified",
      email: "verified@example.com",
      emailVerifiedAt: new Date("2025-02-01T00:00:00.000Z"),
      lastLoginAt: new Date("2025-02-02T00:00:00.000Z"),
    } as const;

    db.user.findMany.mockResolvedValue([
      sampleRow,
      adminRow,
      godRow,
      suspendedRow,
      bannedRow,
      softDeletedRow,
      verifiedRow,
    ]);
    const args = { search: "john", take: 5, skip: 0 };

    // When
    const result = await repo.list(args);

    // Then
    const expectedLength = 7;
    expect(prismaService.getDb).toHaveBeenCalledWith(undefined);
    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: args.take, skip: args.skip }),
    );
    expect(result).toHaveLength(expectedLength);
    expect(result[0].email).toBe(sampleRow.email);
    expect(result[1].role).toBe(UserRole.ADMIN);
    expect(result[2].role).toBe(UserRole.GOD);
    expect(result[3].status).toBe(UserStatus.SUSPENDED);
    expect(result[4].status).toBe(UserStatus.BANNED);
    expect(result[5].status).toBe(UserStatus.SOFT_DELETED);
    expect(result[6].emailVerifiedAt).toStrictEqual(new Date("2025-02-01T00:00:00.000Z"));
    expect(result[6].lastLoginAt).toStrictEqual(new Date("2025-02-02T00:00:00.000Z"));
  });

  it("should delegate to prisma on create", async () => {
    // Given
    const { repo, db, prismaService } = createRepo();
    db.user.create.mockResolvedValue(sampleRow);
    const data = {
      email: sampleRow.email,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    };

    // When
    const result = await repo.create(data);

    // Then
    const expectedRole = data.role;
    expect(prismaService.getDb).toHaveBeenCalledWith(undefined);
    expect(db.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          email: data.email,
          role: expectedRole,
          status: data.status,
        },
        select: UserSelect,
      }),
    );
    expect(result.email).toBe(data.email);
  });

  it("should wrap create errors", async () => {
    // Given
    const { repo, db } = createRepo();
    db.user.create.mockRejectedValue(new Error("db error"));
    const data = {
      email: "user@example.com",
      role: UserRole.USER,
      status: UserStatus.PENDING_VERIFICATION,
    };

    // When
    const action = repo.create(data);

    // Then
    const expected = PersistenceAuthRegisterFailedError;
    await expect(action).rejects.toThrow(expected);
  });

  it("should list users without search criteria", async () => {
    // Given
    const { repo, db, prismaService } = createRepo();
    db.user.findMany.mockResolvedValue([sampleRow]);

    // When
    const users = await repo.list();

    // Then
    expect(prismaService.getDb).toHaveBeenCalledWith(undefined);
    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined, take: 50, skip: 0 }),
    );
    expect(users).toHaveLength(1);
  });

  it("should retrieve credentials with minimal selection", async () => {
    const { repo, db } = createRepo();
    const credentialRow = {
      id: sampleRow.id as Cuid2,
      email: sampleRow.email,
      passwordHash: "hash",
    };
    db.user.findUnique.mockResolvedValue(credentialRow as any);

    const result = await repo.getCredentials(sampleRow.email);

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: sampleRow.email },
      select: { id: true, email: true, passwordHash: true },
    });
    expect(result.passwordHash).toBe("hash");
  });

  it("should wrap credential lookup failures", async () => {
    const { repo, db } = createRepo();
    db.user.findUnique.mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(repo.getCredentials("unknown@example.com")).rejects.toThrow(
      AuthLoginUserNotFoundError,
    );
  });

  it("should update user entity", async () => {
    const { repo, db } = createRepo();
    const entity = new UserEntity({
      id: sampleRow.id as Cuid2,
      email: sampleRow.email,
      passwordHash: "hash",
      status: UserStatus.PENDING_VERIFICATION,
      role: UserRole.USER,
    });

    await repo.update(entity);

    expect(db.user.update).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: sampleRow.email.toLowerCase() }),
      where: { id: sampleRow.id },
    });
  });

  it("should wrap update errors", async () => {
    const { repo, db } = createRepo();
    const entity = new UserEntity({
      id: sampleRow.id as Cuid2,
      email: sampleRow.email,
      passwordHash: "hash",
      status: UserStatus.PENDING_VERIFICATION,
      role: UserRole.USER,
    });
    db.user.update.mockRejectedValue(new Error("update failed"));

    await expect(repo.update(entity)).rejects.toThrow(PersistenceAuthRegisterFailedError);
  });
});
