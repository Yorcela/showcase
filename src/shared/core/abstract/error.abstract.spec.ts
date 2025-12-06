import { HttpStatus } from "@nestjs/common";

import { Dictionnary } from "@apptypes/dictionnary.type";

import { AbstractAppError, ErrorMessageMap } from "./error.abstract";

class SampleError extends AbstractAppError<"CODE_A" | "CODE_B"> {
  constructor(code: "CODE_A" | "CODE_B" = "CODE_A", context?: Dictionnary) {
    const map: ErrorMessageMap<"CODE_A" | "CODE_B"> = {
      CODE_A: "Message A",
      CODE_B: "Message B",
    };
    super(map, code, context, HttpStatus.BAD_REQUEST);
  }
}

describe("AbstractAppError", () => {
  it("should expose message with context when provided", () => {
    // Given
    const context = { key: "value" };

    // When
    const error = new SampleError("CODE_A", context);

    // Then
    expect(error.message).toBe("Message A");
    expect((error as any).toJSON()).toMatchObject({
      code: "CODE_A",
      context,
      httpStatus: HttpStatus.BAD_REQUEST,
    });
  });

  it("should generate swagger metadata from subclass", () => {
    // Given / When
    const swagger = SampleError.toSwagger();

    // Then
    const expected = {
      status: HttpStatus.BAD_REQUEST,
      example: {
        code: "CODE_A",
        message: "Message A",
      },
    };
    expect(swagger).toEqual(expected);
  });

  it("should build message without context when not provided", () => {
    const error = new SampleError("CODE_B");

    expect(error.message).toBe("Message B");
    expect((error as any).toJSON().context).toBeNull();
  });
});
