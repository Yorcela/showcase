import { AbstractUseCase } from "./usecase.abstract";

class TestUseCase extends AbstractUseCase {
  getLoggerContext(): string {
    return (this.logger as any).context;
  }
}

describe("AbstractUseCase", () => {
  it("should initialise a contextual logger for subclasses", () => {
    // Given
    const usecase = new TestUseCase();

    // When
    const loggerContext = usecase.getLoggerContext();

    // Then
    expect(loggerContext).toBe("TestUseCase");
  });
});
