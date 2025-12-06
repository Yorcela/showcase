import { SecuredToken } from "@apptypes/secured-token.type";
import { OtpEntity } from "./otp.entity";

describe("OtpEntity", () => {
  it("should mark entity as expired when past expiration", () => {
    // Given
    const token = "token" as SecuredToken;
    const pastDate = new Date(Date.now() - 60_000);
    const otp = new OtpEntity("123456", token, pastDate);

    // When
    const result = otp.isExpired();

    // Then
    const expected = true;
    expect(result).toBe(expected);
  });

  it("should mark entity as not expired before expiration", () => {
    // Given
    const token = "token" as SecuredToken;
    const futureDate = new Date(Date.now() + 60_000);
    const otp = new OtpEntity("123456", token, futureDate);

    // When
    const result = otp.isExpired();

    // Then
    const expected = false;
    expect(result).toBe(expected);
  });
});
