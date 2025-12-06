import { AbstractAppSuccess } from "./success.abstract";

class DummySuccess extends AbstractAppSuccess<"CODE", { foo: string }> {
  constructor() {
    super("CODE", { foo: "bar" });
  }
}

describe("AbstractAppSuccess", () => {
  it("should expose code and payload", () => {
    // Given / When
    const success = new DummySuccess();

    // Then
    expect(success.code).toBe("CODE");
    expect(success.payload).toEqual({ foo: "bar" });
    expect(success.toJSON()).toEqual({ code: "CODE", payload: { foo: "bar" } });
  });
});
