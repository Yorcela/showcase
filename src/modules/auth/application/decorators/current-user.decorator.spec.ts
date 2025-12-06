import { ExecutionContext } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";

import { CurrentUser } from "./current-user.decorator";

const createContext = (user: any): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

const extractFactory = () => {
  class Dummy {
    handler(@CurrentUser() _user: unknown) {}
  }
  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, Dummy, "handler");
  const paramMeta = Object.values(metadata)[0] as {
    factory: (data: unknown, ctx: ExecutionContext) => any;
    data: unknown;
  };
  return paramMeta;
};

describe("CurrentUser decorator", () => {
  it("should extract user from request", () => {
    const { factory, data } = extractFactory();
    const payload = { userId: "usr_1", sessionId: "ses_1", issuedAt: 1234 };
    const ctx = createContext(payload);

    const result = factory(data, ctx);

    expect(result).toBe(payload);
  });

  it("should return undefined when request user missing", () => {
    const { factory, data } = extractFactory();
    const ctx = createContext(undefined);

    const result = factory(data, ctx);

    expect(result).toBeUndefined();
  });
});
