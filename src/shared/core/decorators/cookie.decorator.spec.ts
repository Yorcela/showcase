import { ExecutionContext } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";

import { Cookie } from "./cookie.decorator";

const createContext = (request: any): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

const extractFactory = () => {
  class Dummy {
    handler(@Cookie("token") _token: string) {}
  }
  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, Dummy, "handler");
  const paramMeta = Object.values(metadata)[0] as {
    factory: (data: unknown, ctx: ExecutionContext) => any;
    data: unknown;
  };
  return paramMeta;
};

describe("Cookie decorator", () => {
  it("should extract cookie value when present", () => {
    const { factory, data } = extractFactory();
    const ctx = createContext({ cookies: { token: "value" } });

    const result = factory(data, ctx);

    expect(result).toBe("value");
  });

  it("should return null when cookie missing", () => {
    const { factory, data } = extractFactory();
    const ctx = createContext({ cookies: {} });

    const result = factory(data, ctx);

    expect(result).toBeNull();
  });

  it("should tolerate undefined request", () => {
    const { factory, data } = extractFactory();
    const ctx = createContext(undefined);

    const result = factory(data, ctx);

    expect(result).toBeNull();
  });
});
