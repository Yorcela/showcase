import { HexTokenValidator } from "./hex-token.validator";

describe("HexTokenValidator", () => {
  it("should validate lowercase hexadecimal token", () => {
    // Given
    const validator = new HexTokenValidator();

    // When
    const valid = validator.verify("a".repeat(64));
    const invalid = validator.verify("ZZZZ");

    // Then
    expect(valid.valid).toBe(true);
    expect(invalid.valid).toBe(false);
  });

  it("should normalize matching keys", () => {
    // Given
    const validator = new HexTokenValidator();
    const input = { tokenValue: "  ABCD  " };

    // When
    validator["normalizeInObject"](input, true);

    // Then
    const expected = "abcd";
    expect(input.tokenValue).toBe(expected);
  });

  it("should provide default reason via validateInObject", () => {
    // Given
    const validator = new HexTokenValidator();

    // When
    const results = validator.validateInObject({ token: "ZZZZ" });

    // Then
    expect(results[0]).toMatchObject({
      reason: "token: Invalid Hex Token format",
      suggestions: ["Check Hex Token format"],
    });
  });

  it("should expose static _isValid helper", () => {
    expect(HexTokenValidator._isValid("".padEnd(64, "a"))).toBe(true);
    expect(HexTokenValidator._isValid("zzzz")).toBe(false);
  });

  it("should normalize null to empty string", () => {
    const validator = new HexTokenValidator();
    expect((validator as any).normalize(null)).toBe("");
  });
});
