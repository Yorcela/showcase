import { asHashedToken } from "./hashed-token.type";
import { ValidatorInvalidHexTokenError } from "../core/errors/app.error";

describe("secured-token.type", () => {
  it("should accept valid hex token", () => {
    // Given
    const token = "a".repeat(64);

    // When
    const secured = asHashedToken(token);

    // Then
    expect(secured).toBe(token);
  });

  it("should throw for invalid token", () => {
    // Given
    const invalid = "ZZZZ";

    // When / Then
    expect(() => asHashedToken(invalid)).toThrow(ValidatorInvalidHexTokenError);
  });
});
