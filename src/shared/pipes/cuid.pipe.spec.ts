import { CuidPipe } from "./cuid.pipe";
import { ValidatorInvalidCuidError } from "../core/errors/app.error";
import { CuidValidator } from "../validators/cuid.validator";

describe("CuidPipe", () => {
  it("should delegate to validator and throw on errors", () => {
    // Given
    const validator = new CuidValidator();
    jest
      .spyOn(validator, "validateInObject")
      .mockReturnValue([{ valid: false, reason: "id: Invalid" }]);
    const pipe = new CuidPipe(validator);

    // When / Then
    expect(() => pipe.transform({ id: "bad" }, {} as any)).toThrow(ValidatorInvalidCuidError);
  });
});
