import { FrontUrlBuilderService, FrontPageUrls } from "./front-url-template.utils";
import { AppConfig } from "../modules/config/app.config";

describe("FrontUrlBuilderService", () => {
  const createBuilder = (frontUrl: string | undefined) => {
    const appConfig = {
      getFrontendUrl: jest.fn(() => frontUrl),
    } as unknown as AppConfig;
    return new FrontUrlBuilderService(appConfig);
  };

  it("should build url with trimmed base and encoded params", () => {
    // Given
    const builder = createBuilder(" https://front.example/ ");
    const params = { token: "abc xyz", code: 123 };

    // When
    const url = builder.buildFrontUrl(FrontPageUrls.REGISTER_VERIFYEMAIL, params);

    // Then
    expect(url).toBe("https://front.example/register/verify?token=abc%20xyz&code=123");
  });

  it("should handle paths without params", () => {
    // Given
    const builder = createBuilder("https://front.example");

    // When
    const url = builder.buildFrontUrl(FrontPageUrls.RESET_PASSWORD, { token: "abc" });

    // Then
    expect(url).toBe("https://front.example/auth/reset-password?token=abc");
  });

  it("should fallback to empty base url when config missing", () => {
    const builder = createBuilder(undefined);
    const url = builder.buildFrontUrl(FrontPageUrls.RESET_PASSWORD, { token: "abc" });
    expect(url).toBe("/auth/reset-password?token=abc");
  });
});
