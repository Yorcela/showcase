import { Cuid2 } from "@apptypes/cuid2.type";
import {
  UserEntity,
  UserRole,
  UserStatus,
  getUserRolesList,
  getUserStatusList,
} from "./user.entity";

describe("UserEntity", () => {
  const baseProps = {
    id: "user-1" as Cuid2,
    email: "user@example.com",
    passwordHash: "hashed-password",
    status: UserStatus.PENDING_VERIFICATION,
    role: UserRole.USER,
  };

  it("should normalize email to lowercase on construction", () => {
    const entity = new UserEntity({ ...baseProps, email: "Upper@Example.COM" });
    expect(entity.email).toBe("upper@example.com");
  });

  it("should map from raw and preserve optional fields", () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-01-01T01:00:00.000Z");
    const raw = {
      ...baseProps,
      firstName: "John",
      lastName: "doe",
      phone: "+33102030405",
      emailVerifiedAt: createdAt,
      createdAt,
      updatedAt,
      lastLoginAt: new Date("2024-01-02T00:00:00.000Z"),
    };

    const entity = UserEntity.fromRaw(raw);
    const serialized = entity.toRaw();

    expect(entity.firstName).toBe("John");
    expect(entity.emailVerifiedAt).toEqual(createdAt);
    expect(serialized).toEqual(raw);
  });

  it("should compute full name with uppercase last name", () => {
    // Given
    const entity = new UserEntity({
      ...baseProps,
      firstName: "John",
      lastName: "doe",
    });

    // When
    const result = entity.fullName;

    // Then
    const expected = "John DOE";
    expect(result).toBe(expected);
  });

  it("should reflect active status", () => {
    // Given
    const entity = new UserEntity({ ...baseProps, status: UserStatus.ACTIVE });

    // When
    const result = entity.isActive;

    // Then
    const expected = true;
    expect(result).toBe(expected);
  });

  it("should reflect pending verification status", () => {
    // Given
    const entity = new UserEntity(baseProps);

    // When
    const result = entity.isPendingVerification;

    // Then
    const expected = true;
    expect(result).toBe(expected);
  });

  it("should identify admin and god roles", () => {
    // Given
    const admin = new UserEntity({ ...baseProps, role: UserRole.ADMIN });
    const god = new UserEntity({ ...baseProps, role: UserRole.GOD });

    // When
    const isAdmin = admin.isAdmin;
    const isGod = god.isAdmin;

    // Then
    expect(isAdmin).toBe(true);
    expect(isGod).toBe(true);
  });

  it("should expose helper conversions", () => {
    const entity = new UserEntity({
      ...baseProps,
      email: "Other@example.com",
      lastLoginAt: undefined,
    });

    const raw = entity.toRaw();
    const rehydrated = entity.fromRaw(raw);

    expect(raw.email).toBe("other@example.com");
    expect(rehydrated.email).toBe("other@example.com");
    expect(rehydrated.lastLoginAt).toBeNull();
  });

  it("should delegate password comparison to provided hasher", async () => {
    const entity = new UserEntity(baseProps);
    const hasher = {
      compare: jest.fn().mockResolvedValue(true),
      hash: jest.fn(),
    };

    const result = await entity.comparePassword("plain-password", hasher);

    expect(result).toBe(true);
    expect(hasher.compare).toHaveBeenCalledWith(baseProps.passwordHash, "plain-password");
  });

  it("should stamp login date when login is invoked", () => {
    jest.useFakeTimers().setSystemTime(new Date("2025-03-01T10:00:00.000Z"));
    const entity = new UserEntity(baseProps);

    entity.login();

    expect(entity.lastLoginAt).toEqual(new Date("2025-03-01T10:00:00.000Z"));
    jest.useRealTimers();
  });

  it("should activate user and set verification timestamp", () => {
    jest.useFakeTimers().setSystemTime(new Date("2025-04-01T09:00:00.000Z"));
    const entity = new UserEntity(baseProps);

    entity.activate();

    expect(entity.isActive).toBe(true);
    expect(entity.emailVerifiedAt).toEqual(new Date("2025-04-01T09:00:00.000Z"));
    expect(entity.lastLoginAt).toEqual(new Date("2025-04-01T09:00:00.000Z"));
    jest.useRealTimers();
  });

  it("should expose suspended, banned and deleted flags", () => {
    const suspended = new UserEntity({ ...baseProps, status: UserStatus.SUSPENDED });
    const banned = new UserEntity({ ...baseProps, status: UserStatus.BANNED });
    const deleted = new UserEntity({ ...baseProps, status: UserStatus.SOFT_DELETED });

    expect(suspended.isSuspended).toBe(true);
    expect(banned.isBanned).toBe(true);
    expect(deleted.isDeleted).toBe(true);
  });
});

describe("User helpers", () => {
  it("should list roles", () => {
    // Given / When
    const result = getUserRolesList();

    // Then
    const expected = [UserRole.USER, UserRole.ADMIN, UserRole.GOD];
    expect(result).toEqual(expected);
  });

  it("should list statuses", () => {
    // Given / When
    const result = getUserStatusList();

    // Then
    const expected = [
      UserStatus.PENDING_VERIFICATION,
      UserStatus.ACTIVE,
      UserStatus.SUSPENDED,
      UserStatus.BANNED,
      UserStatus.SOFT_DELETED,
    ];
    expect(result).toEqual(expected);
  });
});
