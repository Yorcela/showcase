import { Test } from "@nestjs/testing";

import { EmailSanitizer } from "./email.sanitizer";
import { GlobalSanitizerInterceptor } from "./global.interceptor";
import { SanitizeModule } from "./sanitize.module";

describe("SanitizeModule", () => {
  it("should provide email sanitizer and interceptor", async () => {
    // Given
    const moduleRef = await Test.createTestingModule({
      imports: [SanitizeModule],
    }).compile();

    // When
    const emailSanitizer = moduleRef.get(EmailSanitizer);
    const interceptor = moduleRef.get(GlobalSanitizerInterceptor);

    // Then
    expect(emailSanitizer).toBeInstanceOf(EmailSanitizer);
    expect(interceptor).toBeInstanceOf(GlobalSanitizerInterceptor);
  });
});
