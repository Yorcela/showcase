import { AbstractValidatorPipe } from "./abstract.pipe";
import { ValidatorAbstract } from "../validators/abstract.validator";

class DummyValidator extends ValidatorAbstract<string> {
  constructor() {
    super("key");
  }

  protected normalize(value: string): string {
    return value.trim();
  }

  protected isValid(value: string): boolean {
    return value === "valid";
  }

  protected isTargetValue(value: unknown): value is string {
    return typeof value === "string";
  }
}

class DummyError extends Error {
  constructor(public readonly payload: any) {
    super("Invalid");
  }
}

class DummyPipe extends AbstractValidatorPipe<DummyValidator> {
  protected ErrorType = DummyError;
}

describe("AbstractValidatorPipe", () => {
  it("should pass through when data valid", () => {
    // Given
    const validator = new DummyValidator();
    jest.spyOn(validator, "validateInObject").mockReturnValue([]);
    const pipe = new DummyPipe(validator);
    const dto = { key: "valid" };

    // When
    const result = pipe.transform(dto, {} as any);

    // Then
    expect(result).toBe(dto);
  });

  it("should throw when validation errors exist", () => {
    // Given
    const validator = new DummyValidator();
    jest
      .spyOn(validator, "validateInObject")
      .mockReturnValue([{ valid: false, reason: "key: Invalid" }]);
    const pipe = new DummyPipe(validator);

    // When / Then
    expect(() => pipe.transform({ key: "invalid" }, {} as any)).toThrow(DummyError);
  });

  it("should skip validation for primitive values", () => {
    // Given
    const validator = new DummyValidator();
    const spy = jest.spyOn(validator, "validateInObject");
    const pipe = new DummyPipe(validator);

    // When
    const result = pipe.transform("plain string", {} as any);

    // Then
    expect(result).toBe("plain string");
    expect(spy).not.toHaveBeenCalled();
  });

  it("should skip validation for nullish values", () => {
    // Given
    const validator = new DummyValidator();
    const spy = jest.spyOn(validator, "validateInObject");
    const pipe = new DummyPipe(validator);

    // When
    const result = pipe.transform(undefined, {} as any);

    // Then
    expect(result).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });
});
