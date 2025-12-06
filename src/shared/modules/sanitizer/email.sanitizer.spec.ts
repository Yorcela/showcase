import { EmailSanitizer } from "./email.sanitizer";

describe("EmailSanitizer", () => {
  it("should lowercase and trim emails", () => {
    // Given
    const sanitizer = new EmailSanitizer();
    const dto = { email: " USER@Example.COM " };

    // When
    sanitizer.sanitizeInObject(dto, true);

    // Then
    expect(dto.email).toBe("user@example.com");
  });

  it("should return new sanitized object when mutate is false", () => {
    // Given
    const sanitizer = new EmailSanitizer();
    const dto = { profile: { contactEmail: " ADMIN@Example.COM " } };

    // When
    const result = sanitizer.sanitizeInObject(dto, false);

    // Then
    expect(dto.profile.contactEmail).toBe(" ADMIN@Example.COM ");
    expect(result.profile.contactEmail).toBe("admin@example.com");
  });

  it("should handle nullish values via sanitize method", () => {
    const sanitizer = new EmailSanitizer();
    const result = (sanitizer as any).sanitize(null);
    expect(result).toBe("");
  });
});
