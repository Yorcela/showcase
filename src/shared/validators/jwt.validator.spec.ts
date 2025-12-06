import { JwtTokenValidator } from "./jwt.validator";

describe("JwtTokenValidator", () => {
  let validator: JwtTokenValidator;

  beforeEach(() => {
    validator = new JwtTokenValidator();
  });

  it("should validate jwt structure", () => {
    // Given
    const token = "header.payload.signature";
    const invalid = "invalid-token";

    // When
    const validResult = validator.verify(token);
    const invalidResult = validator.verify(invalid);

    // Then
    expect(validResult.valid).toBe(true);
    expect(invalidResult.valid).toBe(false);
  });

  it("should trim token during normalization", () => {
    // Given
    const input = { jwtToken: "  header.payload.signature  " };

    // When
    validator["normalizeInObject"](input, true);

    // Then
    const expected = "header.payload.signature";
    expect(input.jwtToken).toBe(expected);
  });

  it("should surface default reason when invalid in object", () => {
    // Given
    const result = validator.validateInObject({ jwt: "invalid" });

    // Then
    expect(result[0]).toMatchObject({ reason: "jwt: Invalid JWT format" });
  });

  it("should expose static _isValid helper", () => {
    expect(JwtTokenValidator._isValid("header.payload.signature")).toBe(true);
    expect(JwtTokenValidator._isValid("invalid")).toBe(false);
  });

  it("should normalize null values to empty string", () => {
    const normalized = (validator as any).normalize(null);
    expect(normalized).toBe("");
  });
});
