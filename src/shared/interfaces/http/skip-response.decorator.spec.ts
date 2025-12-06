import { SetMetadata } from "@nestjs/common";

import { SkipAppResponse, SKIP_APP_RESPONSE } from "./skip-response.decorator";

jest.mock("@nestjs/common", () => ({
  SetMetadata: jest.fn().mockReturnValue(() => ({})),
}));

describe("SkipAppResponse decorator", () => {
  it("should register metadata flag", () => {
    // Given / When
    SkipAppResponse();

    // Then
    expect(SetMetadata).toHaveBeenCalledWith(SKIP_APP_RESPONSE, true);
  });
});
