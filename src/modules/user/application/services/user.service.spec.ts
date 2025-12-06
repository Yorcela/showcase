import { PasswordHashArgon2Adapter } from "@infrastructure/security/argon2/password-hash.adapter";
import { AuthLoginInvalidCredentialError } from "@modules/auth/domain/errors/login.error";
import { Cuid2 } from "@apptypes/cuid2.type";
import { UserService } from "./user.service";

import { UserEntity, UserRole, UserStatus } from "../../domain/entities/user.entity";
import { UserRepoPort } from "../ports/user.repo.port";

describe("UserService", () => {
  const future = new Date("2025-01-01T00:00:00.000Z");

  const createUser = (overrides: Partial<UserEntity> = {}) =>
    new UserEntity({
      id: "user-1" as Cuid2,
      email: "user@example.com",
      passwordHash: "hashed",
      status: UserStatus.PENDING_VERIFICATION,
      role: UserRole.USER,
      createdAt: future,
      updatedAt: future,
      lastLoginAt: null,
      ...overrides,
    });

  const createService = () => {
    const repo: jest.Mocked<UserRepoPort> = {
      getById: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      getCredentials: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<UserRepoPort>;

    const hasher = {
      compare: jest.fn(),
      hash: jest.fn(),
    } as unknown as jest.Mocked<PasswordHashArgon2Adapter>;

    const service = new UserService(repo, hasher);
    return { service, repo, hasher };
  };

  it("should delegate getById", async () => {
    // Given
    const { service, repo } = createService();
    const user = createUser();
    repo.getById.mockResolvedValue(user);

    // When
    const result = await service.getById(user.id);

    // Then
    const expected = user;
    expect(repo.getById).toHaveBeenCalledWith(user.id, undefined);
    expect(result).toBe(expected);
  });

  it("should delegate getByEmail", async () => {
    // Given
    const { service, repo } = createService();
    const user = createUser();
    repo.findByEmail.mockResolvedValue(user);

    // When
    const result = await service.getByEmail(user.email);

    // Then
    const expected = user;
    expect(repo.findByEmail).toHaveBeenCalledWith(user.email, undefined);
    expect(result).toBe(expected);
  });

  it("should delegate list", async () => {
    // Given
    const { service, repo } = createService();
    const user = createUser();
    const args = { search: "john", take: 10, skip: 5 };
    repo.list.mockResolvedValue([user]);

    // When
    const result = await service.list(args);

    // Then
    const expected = [user];
    expect(repo.list).toHaveBeenCalledWith(args);
    expect(result).toEqual(expected);
  });

  it("should return existing user on findOrCreate", async () => {
    // Given
    const { service, repo } = createService();
    const user = createUser({ status: UserStatus.ACTIVE });
    repo.findByEmail.mockResolvedValue(user);

    // When
    const result = await service.findOrCreate(user.email);

    // Then
    const expected = user;
    expect(repo.create).not.toHaveBeenCalled();
    expect(result).toBe(expected);
  });

  it("should create user when not existing", async () => {
    // Given
    const { service, repo } = createService();
    const user = createUser();
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue(user);

    // When
    const result = await service.findOrCreate(user.email);

    // Then
    const expectedRole = UserRole.USER;
    expect(repo.create).toHaveBeenCalledWith(
      {
        email: user.email,
        role: expectedRole,
        status: UserStatus.PENDING_VERIFICATION,
      },
      undefined,
    );
    expect(result).toBe(user);
  });

  it("should register user with provided payload", async () => {
    // Given
    const { service, repo } = createService();
    const data = {
      email: "admin@example.com",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    };
    const user = createUser({ ...data });
    repo.create.mockResolvedValue(user);

    // When
    const result = await service.register(data);

    // Then
    const expected = user;
    expect(repo.create).toHaveBeenCalledWith(data, undefined);
    expect(result).toBe(expected);
  });

  it("should validate credentials and return user id", async () => {
    const { service, repo, hasher } = createService();
    const user = createUser({ id: "usr_99" as Cuid2 });
    repo.getCredentials.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(true);

    const result = await service.checkCredentials(user.email, "plain");

    expect(repo.getCredentials).toHaveBeenCalledWith(user.email, undefined);
    expect(hasher.compare).toHaveBeenCalledWith(user.passwordHash, "plain");
    expect(result).toBe(user.id);
  });

  it("should throw when credentials are invalid", async () => {
    const { service, repo, hasher } = createService();
    const user = createUser();
    repo.getCredentials.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(false);

    await expect(service.checkCredentials(user.email, "wrong")).rejects.toBeInstanceOf(
      AuthLoginInvalidCredentialError,
    );
  });
});
