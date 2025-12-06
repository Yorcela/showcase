import { EmailVerificationRepoPort } from "./email-verification.repo.port";

type Factory = () => EmailVerificationRepoPort;
type Hooks = {
  beforeEach?: () => Promise<void> | void;
  afterEach?: () => Promise<void> | void;
};

export function verificationRepoContract(makeRepo: Factory, hooks: Hooks = {}) {
  describe("VerificationRepo contract", () => {
    beforeEach(async () => {
      await hooks.beforeEach?.();
    });
    afterEach(async () => {
      await hooks.afterEach?.();
    });

    const base = {
      userId: "usr_123",
      email: "User@Example.com",
      code: "123456",
      tokenHash: "hash_abc",
    };

    it("should create and find by tokenHash (and normalize email to lowercase)", async () => {
      // Given
      const repo = makeRepo();
      const expiresAt = new Date(Date.now() + 60_000);

      // When
      await repo.create({ ...base, expiresAt });
      const found = await repo.findValidByTokenHash(base.tokenHash);

      // Then
      const expectedEmail = "user@example.com";
      expect(found).not.toBeNull();
      expect(found!.email).toBe(expectedEmail);
      expect(found!.code).toBe(base.code);
      expect(found!.userId).toBe(base.userId);
    });

    it("should return null when entry is expired", async () => {
      // Given
      const repo = makeRepo();
      const expiredHash = "hash_expired";
      const expiresAt = new Date(Date.now() - 1);

      // When
      await repo.create({ ...base, tokenHash: expiredHash, expiresAt });
      const found = await repo.findValidByTokenHash(expiredHash);

      // Then
      const expected = null;
      expect(found).toBe(expected);
    });

    it("should consume entry (then not findable anymore)", async () => {
      // Given
      const repo = makeRepo();
      const consumableHash = "hash_consume";
      const expiresAt = new Date(Date.now() + 60_000);
      await repo.create({ ...base, tokenHash: consumableHash, expiresAt });

      // When
      const before = await repo.findValidByTokenHash(consumableHash);
      await repo.consume(before!.token);
      const after = await repo.findValidByTokenHash(consumableHash);

      // Then
      const expected = null;
      expect(before).not.toBeNull();
      expect(after).toBe(expected);
    });
  });
}
