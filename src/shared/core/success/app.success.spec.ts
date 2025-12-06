import { AppSuccess } from "./app.success";
import { AppSuccessCode } from "./registry.success";

describe("AppSuccess", () => {
  it("should extend abstract success with payload", () => {
    // Given
    const payload = { message: "ok" } as any;

    // When
    const success = new AppSuccess(AppSuccessCode.OK, payload);

    // Then
    expect(success.code).toBe(AppSuccessCode.OK);
    expect(success.payload).toBe(payload);
    expect(success.toJSON()).toEqual({ code: AppSuccessCode.OK, payload });
  });
});
