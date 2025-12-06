import { of } from "rxjs";

jest.mock("./email.sanitizer", () => ({
  EmailSanitizer: jest.fn().mockImplementation(() => ({
    sanitizeInObject: jest.fn(),
  })),
}));

import { EmailSanitizer } from "./email.sanitizer";
import { GlobalSanitizerInterceptor } from "./global.interceptor";

describe("GlobalSanitizerInterceptor", () => {
  it("should sanitize response payloads", (done) => {
    // Given
    const emailSanitizer = new EmailSanitizer() as any;
    const interceptor = new GlobalSanitizerInterceptor(emailSanitizer);
    const handler = { handle: () => of({ email: "USER@example.com" }) };

    // When
    interceptor.intercept({} as any, handler).subscribe((data) => {
      // Then
      expect(emailSanitizer.sanitizeInObject).toHaveBeenCalledWith(
        { email: "USER@example.com" },
        true,
      );
      expect(data).toEqual({ email: "USER@example.com" });
      done();
    });
  });

  it("should ignore primitive responses", (done) => {
    // Given
    const emailSanitizer = new EmailSanitizer() as any;
    const interceptor = new GlobalSanitizerInterceptor(emailSanitizer);
    const handler = { handle: () => of("primitive") };

    // When
    interceptor.intercept({} as any, handler).subscribe((data) => {
      expect(emailSanitizer.sanitizeInObject).not.toHaveBeenCalled();
      expect(data).toBe("primitive");
      done();
    });
  });
});
