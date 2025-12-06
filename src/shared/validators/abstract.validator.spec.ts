import { ValidatorResult, StringValidator } from "./abstract.validator";

class UppercaseValidator extends StringValidator {
  constructor() {
    super("name");
  }

  protected normalize(value: string): string {
    return value.trim().toUpperCase();
  }

  protected isValid(value: string): boolean {
    return value.length >= 3;
  }
}

describe("ValidatorAbstract", () => {
  let validator: UppercaseValidator;

  beforeEach(() => {
    validator = new UppercaseValidator();
  });

  it("should normalize nested structures in place by default", () => {
    const payload = {
      name: "  alice ",
      info: {
        nickName: "  bob ",
        tags: [{ userName: "  carol " }],
      },
    };

    validator["normalizeInObject"](payload, true);

    expect(payload.name).toBe("ALICE");
    expect(payload.info.nickName).toBe("BOB");
    expect(payload.info.tags[0].userName).toBe("CAROL");
  });

  it("should normalize without mutating original object when mutate flag is false", () => {
    const payload = { name: "  alice " };

    const result = validator["normalizeInObject"](payload, false);

    expect(payload.name).toBe("  alice ");
    expect(result.name).toBe("ALICE");
  });

  it("should verify values and include suggestions when invalid", () => {
    const suggestions = ["Try a longer value"];
    const resValid: ValidatorResult = validator.verify("ABC", "short", suggestions);
    const resInvalid: ValidatorResult = validator.verify("AB", "short", suggestions);

    expect(resValid).toEqual({ valid: true });
    expect(resInvalid).toEqual({ valid: false, reason: "short", suggestions });
  });

  it("should collect errors when validation fails inside objects", () => {
    const payload = {
      name: "al",
      info: {
        primaryName: "anna",
        nested: [{ displayName: "zz" }],
      },
    };

    const errors = validator.validateInObject(payload);

    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatchObject({
      valid: false,
      reason: "name: Invalid value",
    });
    expect(errors[1]).toMatchObject({
      valid: false,
      reason: "info.nested.0.displayName: Invalid value",
    });
  });

  it("should support static _isValid helper", () => {
    expect(UppercaseValidator._isValid("ABC")).toBe(true);
    expect(UppercaseValidator._isValid("ab")).toBe(false);
  });
});
