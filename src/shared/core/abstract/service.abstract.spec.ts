import { AbstractService } from "./service.abstract";

class TestService extends AbstractService {
  constructor() {
    super();
  }

  getLoggerName() {
    return (this.logger as any).context;
  }
}

describe("AbstractService", () => {
  it("should expose a logger named after the subclass", () => {
    // Given
    const service = new TestService();

    // When
    const loggerName = service.getLoggerName();

    // Then
    expect(loggerName).toBe("TestService");
  });
});
