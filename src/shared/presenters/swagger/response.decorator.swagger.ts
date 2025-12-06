import { applyDecorators, Type } from "@nestjs/common";
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from "@nestjs/swagger";

export type ErrorSchema = { code: string; message: string; context?: any };
const ErrorSchemaRef = {
  type: "object",
  properties: {
    code: { type: "string", example: "AUTH_REG_EMAIL_SEND_FAILED" },
    message: { type: "string", example: "Failed to send registration email" },
    context: { type: "object", nullable: true },
  },
};

export function ApiSuccessResponse<TModel extends Type<any>>(
  model: TModel,
  status = 200,
  opts?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description: opts?.description,
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}

export function ApiErrorResponse(status: number, example?: Partial<ErrorSchema>) {
  return ApiResponse({
    status,
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        error: {
          ...ErrorSchemaRef,
          ...(example ? { example } : {}),
        },
      },
    },
  });
}

/**
 * Regroupe success + erreurs fréquentes
 */
export function ApiResponseEnvelope<TModel extends Type<any>>(params: {
  model: TModel;
  successStatus?: number;
  description?: string;
  errors?: Array<{ status: number; example?: Partial<ErrorSchema> }>;
}) {
  const { model, successStatus = 200, description, errors = [] } = params;
  return applyDecorators(
    ApiSuccessResponse(model, successStatus, { description }),
    ...errors.map((e) => ApiErrorResponse(e.status, e.example)),
  );
}

/**
 * Petit helper pour l’operation + body (optionnel)
 */
export function ApiOperationWithBody<TBody extends Type<any>>(params: {
  summary: string;
  description?: string;
  body?: TBody;
}) {
  return applyDecorators(
    ApiOperation({ summary: params.summary, description: params.description }),
    ...(params.body ? [ApiBody({ type: params.body })] : []),
  );
}
