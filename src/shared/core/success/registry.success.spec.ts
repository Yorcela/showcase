import {
  AppSuccessCode,
  AppSuccessCodeName,
  AppSuccessCodeValue,
  AppSuccessPayloadTypes,
} from "./registry.success";

describe("AppSuccess registry", () => {
  it("should expose success codes", () => {
    // Given / When
    const codes = Object.values(AppSuccessCode);

    // Then
    expect(codes).toContain("APP_GEN_001");
  });

  it("should type names and payload mapping", () => {
    // Given
    const name: AppSuccessCodeName = "OK";
    const value: AppSuccessCodeValue = AppSuccessCode.OK;
    const payload: AppSuccessPayloadTypes[typeof value] = {};

    // When / Then
    expect(name).toBe("OK");
    expect(value).toBe("APP_GEN_001");
    expect(payload).toEqual({});
  });
});
