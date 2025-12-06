import { EmailPipe } from "./email.pipe";
import { ValidatorInvalidEmailError } from "../core/errors/app.error";
import { EmailValidator } from "../validators/email.validator";

describe("EmailPipe", () => {
  it("should pass value when validator returns no error", () => {
    // Given
    const validator = new EmailValidator();
    jest.spyOn(validator, "validateInObject").mockReturnValue([]);
    const pipe = new EmailPipe(validator);
    const dto = { email: "user@example.com" };

    // When
    const result = pipe.transform(dto, {} as any);

    // Then
    expect(result).toBe(dto);
  });

  it("should throw ValidatorInvalidEmailError when errors exist", () => {
    // Given
    const validator = new EmailValidator();
    jest
      .spyOn(validator, "validateInObject")
      .mockReturnValue([{ valid: false, reason: "email: Invalid" }]);
    const pipe = new EmailPipe(validator);

    // When / Then
    expect(() => pipe.transform({ email: "bad" }, {} as any)).toThrow(ValidatorInvalidEmailError);
  });
});
