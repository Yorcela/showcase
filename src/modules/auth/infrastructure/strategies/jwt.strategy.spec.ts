import { AppConfig } from "@shared/modules/config/app.config";
import { JwtStrategy, JwtPayload } from "./jwt.strategy";

describe("JwtStrategy", () => {
  it("should configure passport strategy with secret and validate payload", async () => {
    const appConfig = {
      getJwtSecret: jest.fn().mockReturnValue("super-secret"),
    } as unknown as AppConfig;

    const strategy = new JwtStrategy(appConfig);

    expect(appConfig.getJwtSecret).toHaveBeenCalled();

    const payload: JwtPayload = {
      sub: "usr_123" as any,
      sid: "ses_456" as any,
      iat: 1700000000,
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: payload.sub,
      sessionId: payload.sid,
      issuedAt: payload.iat,
    });
  });
});
