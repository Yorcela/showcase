import { AbstractHealthSuccess } from "./abstract.success";
import { HealthCheckSuccess } from "./check.success";
import { HealthSuccessCode, HealthSuccessPayloadTypes } from "./registry.success";

class DummyHealthSuccess extends AbstractHealthSuccess<{ foo: string }> {
  constructor() {
    super(HealthSuccessCode.CHECK_SUCCESSFUL, { foo: "bar" });
  }
}

describe("Health success primitives", () => {
  it("should extend AbstractAppSuccess", () => {
    // Given / When
    const instance = new DummyHealthSuccess();

    // Then
    expect(instance.code).toBe(HealthSuccessCode.CHECK_SUCCESSFUL);
    expect(instance.payload).toEqual({ foo: "bar" });
    expect(instance.toJSON()).toEqual({
      code: HealthSuccessCode.CHECK_SUCCESSFUL,
      payload: { foo: "bar" },
    });
  });

  it("should expose registry payload mappings", () => {
    // Given
    // When
    const payloadType: HealthSuccessPayloadTypes[typeof HealthSuccessCode.CHECK_SUCCESSFUL] = {
      status: "ok",
      details: {
        uptime: 1,
        version: "1.0.0",
        environment: "test",
        timestamp: "now",
        responseTime: 10,
        pid: 123,
        nodeVersion: "18.x",
      },
    };

    // Then
    expect(payloadType.status).toBe("ok");
  });
});

describe("HealthCheckSuccess", () => {
  it("should wrap health check payloads with the matching success code", () => {
    // Given
    const payload = {
      status: "ok",
      details: {
        uptime: 1,
        version: "1.0.0",
        environment: "test",
        timestamp: "now",
        responseTime: 10,
        pid: 123,
        nodeVersion: "18.x",
      },
    } as HealthSuccessPayloadTypes[typeof HealthSuccessCode.CHECK_SUCCESSFUL];

    // When
    const success = new HealthCheckSuccess(payload);

    // Then
    expect(success.code).toBe(HealthSuccessCode.CHECK_SUCCESSFUL);
    expect(success.payload).toBe(payload);
  });
});
