import { CuidValidator } from "./cuid.validator";

describe("CuidValidator", () => {
  let validator: CuidValidator;

  beforeEach(() => {
    validator = new CuidValidator();
  });

  it("should accept valid cuid", () => {
    // Given
    const cuid = "cjld2cjxh0000qzrmn831i7rn";

    // When
    const result = validator.verify(cuid);

    // Then
    expect(result.valid).toBe(true);
  });

  it("should reject invalid cuid", () => {
    // Given
    const results = validator.validateInObject({ id: "invalid-cuid" });

    // Then
    const expectedReason = "id: Invalid id format";
    expect(results[0]).toMatchObject({ reason: expectedReason });
    expect(results[0].suggestions).toEqual(["Check cuid format"]);
  });

  it("should normalize values inside arrays", () => {
    const dto = { list: [{ userId: " CUIDVALUE " }] };
    validator["normalizeInObject"](dto, true);
    expect(dto.list[0].userId).toBe("cuidvalue");
  });

  it("should expose static _isValid helper", () => {
    expect(CuidValidator._isValid("cjld2cjxh0000qzrmn831i7rn")).toBe(true);
    expect(CuidValidator._isValid("INVALID")).toBe(false);
  });

  it("should handle null values via normalize helper", () => {
    const normalized = (validator as any).normalize(null);
    expect(normalized).toBe("");
  });
});
