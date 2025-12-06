import {
  createStandardResponse,
  createEmptyResponse,
  createMessageFromCodeAndText,
  getTextForCode,
  createApiMessage,
} from "./response.utils";

describe("response.utils", () => {
  it("should create standard response", () => {
    // Given
    const message = { code: "OK", text: "Success" } as const;

    // When
    const response = createStandardResponse(message, { value: 1 });

    // Then
    expect(response).toEqual({ message, payload: { value: 1 } });
  });

  it("should create empty response", () => {
    // Given
    const message = { code: "EMPTY", text: "Nothing" } as const;

    // When
    const response = createEmptyResponse(message);

    // Then
    expect(response.payload).toEqual({});
  });

  it("should create message from code and text", () => {
    // Given / When
    const message = createMessageFromCodeAndText("CODE", "Text");

    // Then
    expect(message).toEqual({ code: "CODE", text: "Text" });
  });

  it("should build api message with details", () => {
    // Given
    const messages = { CODE: "Base" } as const;

    // When
    const apiMessage = createApiMessage("CODE", messages, "Details");

    // Then
    expect(apiMessage).toEqual({ code: "CODE", text: "Base: Details" });
    expect(getTextForCode("CODE", messages)).toBe("Base");
  });

  it("should build api message without details", () => {
    const messages = { CODE: "Base" } as const;
    const apiMessage = createApiMessage("CODE", messages);
    expect(apiMessage).toEqual({ code: "CODE", text: "Base" });
  });
});
