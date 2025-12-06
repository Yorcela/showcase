import { asSecuredToken } from "./secured-token.type";
import { ValidatorInvalidHexTokenError } from "../core/errors/app.error";

describe("secured-token.type", () => {
  it("should accept valid hex token", () => {
    // Given
    const token = "a".repeat(64);

    // When
    const secured = asSecuredToken(token);

    // Then
    expect(secured).toBe(token);
  });

  it("should throw for invalid token", () => {
    // Given
    const invalid = "ZZZZ";

    // When / Then
    expect(() => asSecuredToken(invalid)).toThrow(ValidatorInvalidHexTokenError);
  });
});
