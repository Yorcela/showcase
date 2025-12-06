import { JwtPipe } from "./jwt.pipe";
import { ValidatorInvalidJwtError } from "../core/errors/app.error";
import { JwtTokenValidator } from "../validators/jwt.validator";

describe("JwtPipe", () => {
  it("should throw when validator errors", () => {
    // Given
    const validator = new JwtTokenValidator();
    jest
      .spyOn(validator, "validateInObject")
      .mockReturnValue([{ valid: false, reason: "jwt: invalid" }]);
    const pipe = new JwtPipe(validator);

    // When / Then
    expect(() => pipe.transform({ jwt: "bad" }, {} as any)).toThrow(ValidatorInvalidJwtError);
  });
});
