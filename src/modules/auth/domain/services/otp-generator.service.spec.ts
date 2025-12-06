import * as crypto from "crypto";

import { HashedToken } from "@apptypes/hashed-token.type";

import { SecuredToken } from "@apptypes/secured-token.type";
import { OtpGeneratorService } from "./otp-generator.service";

jest.mock("crypto", () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from("token")),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("hash"),
  }),
}));

const mockedCrypto = crypto as unknown as {
  randomBytes: jest.Mock;
  createHash: jest.Mock;
};

describe("OtpGeneratorService", () => {
  let service: OtpGeneratorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OtpGeneratorService();
  });

  it("should generate full otp payload", () => {
    // Given
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    // When
    const result = service.generateFullOtpCode(4, 5);

    // Then
    const expectedOtpLength = 4;
    expect(result.code).toHaveLength(expectedOtpLength);
    expect(mockedCrypto.randomBytes).toHaveBeenCalledWith(32);
    const expectedToken = "746f6b656e" as HashedToken;
    expect(result.token).toBe(expectedToken);
    expect(result.tokenHash).toBe("hash");
    const expectedExpiry = new Date(now + 5 * 60_000);
    expect(result.expiresAt.getTime()).toBe(expectedExpiry.getTime());
  });

  it("should use default parameters when omitted", () => {
    // Given
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    // When
    const result = service.generateFullOtpCode();

    // Then
    expect(result.code).toHaveLength(6);
    const expectedExpiry = new Date(now + 10 * 60_000);
    expect(result.expiresAt.getTime()).toBe(expectedExpiry.getTime());
  });

  it("should generate otp code with default length", () => {
    // Given / When
    const code = service.generateOtpCode();

    // Then
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[0-9]+$/);
  });

  it("should generate secured token in lowercase", () => {
    // Given
    mockedCrypto.randomBytes.mockReturnValueOnce({
      toString: () => "ABCDEF",
    } as any);

    // When
    const token = service.generateHashedToken();

    // Then
    expect(token).toBe("abcdef" as HashedToken);
  });

  it("should generate numeric otp code of requested length", () => {
    // Given
    const length = 8;

    // When
    const code = service.generateOtpCode(length);

    // Then
    const expected = length;
    expect(code).toHaveLength(expected);
    expect(code).toMatch(/^[0-9]+$/);
  });

  it("should hash token with sha256", () => {
    // Given
    const token = "secure-token" as SecuredToken;

    // When
    const hash = service.getHashedToken(token);

    // Then
    const expected = "hash";
    expect(mockedCrypto.createHash).toHaveBeenCalledWith("sha256");
    expect(hash).toBe(expected);
  });
});
