import { EmailValidator } from "./email.validator";

describe("EmailValidator", () => {
  let validator: EmailValidator;

  beforeEach(() => {
    validator = new EmailValidator();
  });

  it("should normalize email addresses", () => {
    // Given
    const input = { contactEmail: "  USER@Example.COM  " };

    // When
    validator["normalizeInObject"](input, true);

    // Then
    const expected = "user@example.com";
    expect(input.contactEmail).toBe(expected);
  });

  it("should normalize array of objects when mutate is false", () => {
    const input = { list: [{ Email: " ADMIN@Example.com " }] };
    const result = validator["normalizeInObject"](input, false);
    expect(input.list[0].Email).toBe(" ADMIN@Example.com ");
    expect(result.list[0].Email).toBe("admin@example.com");
  });

  it("should validate proper email format", () => {
    // Given
    const validEmail = "user@example.com";
    const invalidEmail = "user@@example";

    // When
    const valid = validator.verify(validEmail);
    const invalid = validator.verify(invalidEmail);

    // Then
    expect(valid.valid).toBe(true);
    expect(invalid.valid).toBe(false);
    expect(invalid.reason).toBe("");
  });

  it("should return default reason on validation failure", () => {
    // Given
    const invalidEmail = "invalid";

    // When
    const results = validator.validateInObject({ email: invalidEmail });

    // Then
    const expectedReason = "email: Invalid email format";
    expect(results[0]).toMatchObject({ reason: expectedReason });
  });

  it("should normalize null values via normalize helper", () => {
    const normalized = (validator as any).normalize(null);
    expect(normalized).toBe("");
  });
});
