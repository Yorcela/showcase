import { asJwtToken } from "./jwt.type";
import { ValidatorInvalidJwtError } from "../core/errors/app.error";

describe("jwt.type", () => {
  it("should accept valid jwt token", () => {
    // Given
    const token = "header.payload.signature";

    // When
    const jwt = asJwtToken(token);

    // Then
    expect(jwt).toBe(token);
  });

  it("should reject invalid token", () => {
    // Given
    const invalid = "bad-token";

    // When / Then
    expect(() => asJwtToken(invalid)).toThrow(ValidatorInvalidJwtError);
  });
});
