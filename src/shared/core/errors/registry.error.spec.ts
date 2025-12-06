import {
  AppErrorCode,
  AppErrorCodeName,
  AppErrorCodeValue,
  AppErrorMessageMap,
} from "./registry.error";

describe("AppError registry", () => {
  it("should expose stable codes", () => {
    // Given / When
    const codes = Object.values(AppErrorCode);

    // Then
    expect(codes).toContain("DB_001");
    expect(codes).toContain("VAL_EMAIL_001");
  });

  it("should type alias names and values", () => {
    // Given
    const name: AppErrorCodeName = "DATABASE_ERROR";
    const value: AppErrorCodeValue = AppErrorCode.DATABASE_ERROR;

    // When / Then
    expect(AppErrorMessageMap[value]).toBe("Error trying to connect to database");
    expect(name).toBe("DATABASE_ERROR");
  });
});
