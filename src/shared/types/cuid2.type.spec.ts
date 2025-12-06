import { asCuid2 } from "./cuid2.type";
import { ValidatorInvalidCuidError } from "../core/errors/app.error";

describe("cuid2.type", () => {
  it("should accept valid cuid", () => {
    // Given
    const value = "cjld2cjxh0000qzrmn831i7rn";

    // When
    const cuid = asCuid2(value);

    // Then
    expect(cuid).toBe(value);
  });

  it("should throw on invalid cuid", () => {
    // Given
    const invalid = "INVALID";

    // When / Then
    expect(() => asCuid2(invalid)).toThrow(ValidatorInvalidCuidError);
  });
});
