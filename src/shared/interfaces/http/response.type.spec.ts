import { AppResponse } from "./response.type";

describe("AppResponse type", () => {
  it("should allow success payload", () => {
    // Given
    const response: AppResponse<{ value: number }> = {
      success: true,
      data: { value: 42 },
    };

    // Then
    expect(response.success).toBe(true);
    expect(response.data?.value).toBe(42);
  });

  it("should allow error payload", () => {
    // Given
    const response: AppResponse = {
      success: false,
      error: { code: "ERR", message: "Failure", context: { foo: "bar" } },
    };

    // Then
    expect(response.error?.code).toBe("ERR");
    expect(response.error?.context).toEqual({ foo: "bar" });
  });
});
