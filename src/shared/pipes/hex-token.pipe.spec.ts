import { HexTokenPipe } from "./hex-token.pipe";
import { ValidatorInvalidHexTokenError } from "../core/errors/app.error";
import { HexTokenValidator } from "../validators/hex-token.validator";

describe("HexTokenPipe", () => {
  it("should throw when validator reports errors", () => {
    // Given
    const validator = new HexTokenValidator();
    jest
      .spyOn(validator, "validateInObject")
      .mockReturnValue([{ valid: false, reason: "token: invalid" }]);
    const pipe = new HexTokenPipe(validator);

    // When / Then
    expect(() => pipe.transform({ token: "bad" }, {} as any)).toThrow(
      ValidatorInvalidHexTokenError,
    );
  });
});
