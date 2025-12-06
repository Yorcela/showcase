import * as argon2 from "argon2";

import { AppConfig } from "@shared/modules/config/app.config";
import { PasswordHashArgon2Adapter } from "./password-hash.adapter";

jest.mock("argon2", () => ({
  argon2id: Symbol("argon2id"),
  hash: jest.fn(),
  verify: jest.fn(),
}));

const mockedArgon2 = argon2 as unknown as {
  argon2id: symbol;
  hash: jest.Mock;
  verify: jest.Mock;
};

describe("PasswordHashArgon2Adapter", () => {
  const createService = () => {
    const appConfig = {
      getArgon2Memory: jest.fn().mockReturnValue(4096),
      getArgon2Iterations: jest.fn().mockReturnValue(3),
      getArgon2Parallelism: jest.fn().mockReturnValue(2),
    } as unknown as jest.Mocked<AppConfig>;

    const service = new PasswordHashArgon2Adapter(appConfig);
    return { service, appConfig };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should hash password using argon2 with configured options", async () => {
    const { service, appConfig } = createService();
    mockedArgon2.hash.mockResolvedValueOnce("hashed-value");

    const result = await service.hash("plain");

    expect(result).toBe("hashed-value");
    expect(mockedArgon2.hash).toHaveBeenCalledWith("plain", {
      type: mockedArgon2.argon2id,
      memoryCost: appConfig.getArgon2Memory(),
      timeCost: appConfig.getArgon2Iterations(),
      parallelism: appConfig.getArgon2Parallelism(),
    });
  });

  it("should compare password hashes", async () => {
    const { service } = createService();
    mockedArgon2.verify.mockResolvedValueOnce(true);

    await expect(service.compare("hash", "plain")).resolves.toBe(true);
    expect(mockedArgon2.verify).toHaveBeenCalledWith("hash", "plain");
  });

  it("should return false when comparison fails", async () => {
    const { service } = createService();
    mockedArgon2.verify.mockRejectedValueOnce(new Error("invalid"));

    await expect(service.compare("bad", "plain")).resolves.toBe(false);
  });
});
