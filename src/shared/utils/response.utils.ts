export type ApiMessage<E extends string> = {
  code: E;
  text: string;
};

export type StandardApiResponse<E extends string, T> = {
  message: ApiMessage<E>;
  payload: T;
};

export function createStandardResponse<E extends string, T>(
  message: ApiMessage<E>,
  payload: T,
): StandardApiResponse<E, T> {
  return { message, payload };
}

export function createEmptyResponse<E extends string>(
  message: ApiMessage<E>,
): StandardApiResponse<E, Record<string, never>> {
  return createStandardResponse(message, {});
}

export function createMessageFromCodeAndText<E extends string>(
  code: E,
  text: string,
): ApiMessage<E> {
  return { code, text };
}

export function getTextForCode<E extends string>(code: E, messages: Record<E, string>): string {
  return messages[code];
}

export function createApiMessage<E extends string>(
  code: E,
  messages: Record<E, string>,
  details?: string,
  joiner = ": ",
): ApiMessage<E> {
  const text = getTextForCode(code, messages);
  return { code, text: details ? `${text}${joiner}${details}` : text };
}
