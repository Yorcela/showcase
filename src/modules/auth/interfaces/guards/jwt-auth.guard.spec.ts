import { ExecutionContext } from "@nestjs/common";

import { JwtAuthGuard } from "./jwt-auth.guard";

// Mock global du AuthGuard de @nestjs/passport pour ce fichier
jest.mock("@nestjs/passport", () => {
  const actual = jest.requireActual("@nestjs/passport");
  return {
    ...actual,
    AuthGuard: () =>
      class MockAuthGuard {
        canActivate() {
          return true; // autorise tout, pas d'I/O ni de stratégie nécessaire
        }
      },
  };
});

describe("JwtAuthGuard", () => {
  it("should delegate to passport guard", () => {
    // Given
    const guard = new JwtAuthGuard();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
        getNext: () => undefined,
      }),
    } as unknown as ExecutionContext;

    // When
    const result = guard.canActivate(context);

    // Then
    const expected = true;
    expect(result).toBe(expected);
  });
});
