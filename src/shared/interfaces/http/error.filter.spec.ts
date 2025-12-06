import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";

import { AppErrorFilter } from "./error.filter";

describe("AppErrorFilter", () => {
  const createFilter = () => new AppErrorFilter();

  const createResponse = () => {
    const json = jest.fn();
    const res = {
      status: jest.fn().mockReturnValue({ json }),
    } as any;
    return { res, json };
  };

  const createHost = (res: any, body: unknown = undefined): ArgumentsHost => {
    const httpArgumentsHost = {
      getResponse: () => res,
      getRequest: () => ({ body }),
    } as any;
    return {
      switchToHttp: () => httpArgumentsHost,
    } as any;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should format HttpException responses", () => {
    // Given
    const { res, json } = createResponse();
    const filter = createFilter();
    const body = { email: "john@example.com" };
    const host = createHost(res, body);
    const exception = new HttpException(
      { message: "Invalid", code: "CODE" },
      HttpStatus.BAD_REQUEST,
    );

    // When
    filter.catch(exception, host);

    // Then
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: "CODE", message: "Invalid", body, context: undefined },
    });
  });

  it("should handle HttpException string response", () => {
    // Given
    const { res, json } = createResponse();
    const filter = createFilter();
    const host = createHost(res);
    const exception = new HttpException("Simple error", HttpStatus.NOT_FOUND);

    // When
    filter.catch(exception, host);

    // Then
    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: "HTTP_ERROR", message: "Simple error", body: undefined, context: undefined },
    });
  });

  it("should format generic errors", () => {
    // Given
    const { res, json } = createResponse();
    const filter = createFilter();
    const host = createHost(res, { foo: "baz" });
    const exception = {
      code: "INTERNAL",
      message: "Boom",
      context: { foo: "bar" },
      httpStatus: 418,
    };

    // When
    filter.catch(exception, host);

    // Then
    expect(res.status).toHaveBeenCalledWith(418);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INTERNAL",
        message: "Boom",
        body: { foo: "baz" },
        context: { foo: "bar" },
      },
    });
  });

  it("should fallback to defaults when generic error missing fields", () => {
    // Given
    const { res, json } = createResponse();
    const filter = createFilter();
    const host = createHost(res);
    const error = { message: undefined, context: undefined } as any;

    // When
    filter.catch(error, host);

    // Then
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        body: undefined,
        context: undefined,
      },
    });
  });
});
