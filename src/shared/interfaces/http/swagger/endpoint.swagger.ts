import { applyDecorators, HttpStatus, Type } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";

import { REFRESH_COOKIE_NAME } from "@infrastructure/http/cookies/cookie.config";
import {
  ApiOperationWithBody,
  ApiResponseEnvelope,
  ErrorSchema,
} from "../../../presenters/swagger/response.decorator.swagger";

type EndpointSwaggerParams<
  TBody extends Type<unknown> | undefined,
  TResponse extends Type<unknown>,
> = {
  tag?: string;
  summary: string;
  description?: string;
  body?: TBody;
  response: TResponse;
  defaultStatus?: HttpStatus;
  needsCookieAuth?: boolean;
  errors?: Array<{ status: number; example?: Partial<ErrorSchema> }>;
};

const noopClassDecorator: ClassDecorator = () => {};

export const createEndpointSwagger = <
  TBody extends Type<unknown> | undefined,
  TResponse extends Type<unknown>,
>(
  config: EndpointSwaggerParams<TBody, TResponse>,
) => {
  const {
    tag,
    summary,
    description,
    body,
    response,
    defaultStatus = HttpStatus.OK,
    needsCookieAuth = false,
    errors,
  } = config;

  return {
    controller: (): ClassDecorator =>
      tag ? (applyDecorators(ApiTags(tag)) as ClassDecorator) : noopClassDecorator,
    signature: (successStatus: HttpStatus = defaultStatus): MethodDecorator => {
      const decorators: MethodDecorator[] = [];

      if (needsCookieAuth) {
        decorators.push(ApiCookieAuth(REFRESH_COOKIE_NAME) as unknown as MethodDecorator);
      }

      decorators.push(
        ApiOperationWithBody({
          summary,
          description,
          body,
        }) as unknown as MethodDecorator,
      );

      decorators.push(
        ApiResponseEnvelope({
          model: response,
          successStatus,
          errors,
        }) as unknown as MethodDecorator,
      );

      return applyDecorators(...decorators) as MethodDecorator;
    },
  };
};
