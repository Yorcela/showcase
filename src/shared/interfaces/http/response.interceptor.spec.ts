import { CallHandler, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { of } from "rxjs";

import { AppResponseInterceptor } from "./response.interceptor";

describe("AppResponseInterceptor", () => {
  const createContext = (type: string): ExecutionContext =>
    ({
      getType: () => type,
      getHandler: () => ({}) as any,
      getClass: () => ({}) as any,
    }) as any;

  const createHandler = (value: unknown): CallHandler<any> => ({
    handle: () => of(value),
  });

  it("should bypass non-http contexts", (done) => {
    // Given
    const reflector = new Reflector();
    const interceptor = new AppResponseInterceptor(reflector);
    const ctx = createContext("rpc");
    const handler = createHandler({ ok: true });

    // When
    interceptor.intercept(ctx, handler).subscribe((result) => {
      // Then
      expect(result).toEqual({ ok: true });
      done();
    });
  });

  it("should skip wrapping when metadata set", (done) => {
    // Given
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const interceptor = new AppResponseInterceptor(reflector);
    const ctx = createContext("http");
    const handler = createHandler({ already: "wrapped" });

    // When
    interceptor.intercept(ctx, handler).subscribe((result) => {
      // Then
      expect(result).toEqual({ already: "wrapped" });
      done();
    });
  });

  it("should wrap responses by default", (done) => {
    // Given
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const interceptor = new AppResponseInterceptor(reflector);
    const ctx = createContext("http");
    const handler = createHandler({ foo: "bar" });

    // When
    interceptor.intercept(ctx, handler).subscribe((result) => {
      // Then
      expect(result).toEqual({ success: true, data: { foo: "bar" } });
      done();
    });
  });

  it("should passthrough when response already has success flag", (done) => {
    // Given
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const interceptor = new AppResponseInterceptor(reflector);
    const ctx = createContext("http");
    const handler = createHandler({ success: false, error: { code: "X" } });

    // When
    interceptor.intercept(ctx, handler).subscribe((result) => {
      // Then
      expect(result).toEqual({ success: false, error: { code: "X" } });
      done();
    });
  });
});
