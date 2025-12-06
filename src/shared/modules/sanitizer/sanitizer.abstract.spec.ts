import { SanitizerAbstract } from "./sanitizer.abstract";

class SampleSanitizer extends SanitizerAbstract<string> {
  constructor() {
    super("email");
  }

  protected isTargetValue(value: unknown): value is string {
    return typeof value === "string";
  }

  protected sanitize(value: string): string {
    return value.trim().toLowerCase();
  }
}

describe("SanitizerAbstract", () => {
  let sanitizer: SampleSanitizer;

  beforeEach(() => {
    sanitizer = new SampleSanitizer();
  });

  it("should sanitize nested objects", () => {
    // Given
    const dto = {
      email: " USER@example.com ",
      profile: {
        contactEmail: " ADMIN@example.com ",
        list: [{ backupEmail: " SUPPORT@Example.com " }],
      },
    };

    // When
    const result = sanitizer.sanitizeInObject(dto, false);

    // Then
    expect(result.email).toBe("user@example.com");
    expect(result.profile.contactEmail).toBe("admin@example.com");
    expect(result.profile.list[0].backupEmail).toBe("support@example.com");
  });

  it("should mutate original object when requested", () => {
    // Given
    const dto = { email: " USER@example.com " };

    // When
    sanitizer.sanitizeInObject(dto, true);

    // Then
    expect(dto.email).toBe("user@example.com");
  });
});
