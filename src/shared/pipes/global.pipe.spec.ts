import { ArgumentMetadata } from "@nestjs/common";

import { GlobalValidatorPipe } from "./global.pipe";
import { ValidatorInvalidEmailError } from "../core/errors/app.error";
import { CuidValidator } from "../validators/cuid.validator";
import { EmailValidator } from "../validators/email.validator";
import { HexTokenValidator } from "../validators/hex-token.validator";
import { JwtTokenValidator } from "../validators/jwt.validator";

describe("GlobalValidatorPipe", () => {
  const metadata = {} as ArgumentMetadata;

  const createValidatorMocks = () => {
    const order: string[] = [];
    const emailValidator = {
      validateInObject: jest.fn().mockImplementation(() => {
        order.push("email");
        return [];
      }),
    } as unknown as EmailValidator;

    const cuidValidator = {
      validateInObject: jest.fn().mockImplementation(() => {
        order.push("cuid");
        return [];
      }),
    } as unknown as CuidValidator;

    const jwtValidator = {
      validateInObject: jest.fn().mockImplementation(() => {
        order.push("jwt");
        return [];
      }),
    } as unknown as JwtTokenValidator;

    const hexValidator = {
      validateInObject: jest.fn().mockImplementation(() => {
        order.push("hex");
        return [];
      }),
    } as unknown as HexTokenValidator;

    return { order, emailValidator, cuidValidator, jwtValidator, hexValidator };
  };

  it("should invoke validators sequentially", () => {
    const { order, emailValidator, cuidValidator, jwtValidator, hexValidator } =
      createValidatorMocks();
    const pipe = new GlobalValidatorPipe(emailValidator, cuidValidator, jwtValidator, hexValidator);
    const dto = { email: "user@example.com" };

    const result = pipe.transform(dto, metadata);

    expect(result).toBe(dto);
    expect(order).toEqual(["email", "cuid", "jwt", "hex"]);
  });

  it("should throw when a validator emits errors and stop further validation", () => {
    const emailValidator = {
      validateInObject: jest.fn().mockReturnValue([{ reason: "Invalid" }]),
    } as unknown as EmailValidator;
    const cuidValidator = {
      validateInObject: jest.fn().mockReturnValue([]),
    } as unknown as CuidValidator;
    const jwtValidator = {
      validateInObject: jest.fn().mockReturnValue([]),
    } as unknown as JwtTokenValidator;
    const hexValidator = {
      validateInObject: jest.fn().mockReturnValue([]),
    } as unknown as HexTokenValidator;

    const pipe = new GlobalValidatorPipe(emailValidator, cuidValidator, jwtValidator, hexValidator);

    expect(() => pipe.transform({ email: "invalid" }, metadata)).toThrow(
      ValidatorInvalidEmailError,
    );
    expect(cuidValidator.validateInObject).not.toHaveBeenCalled();
  });
});
