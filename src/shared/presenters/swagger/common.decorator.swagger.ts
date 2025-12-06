import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, ValidationOptions } from "class-validator";

export type SwaggerPrimitive =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor;

export interface DecoratorOptions {
  required?: boolean;
  isEmail?: boolean;
  isInValues?: readonly any[];
  isInValidationOptions?: ValidationOptions;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  defaultSize?: number;
}
export const buildDecorator = (
  type: SwaggerPrimitive,
  description: string,
  example: any,
  options?: DecoratorOptions,
) => {
  const required = options?.required ?? true;

  const apiOpts: ApiPropertyOptions = {
    type,
    description,
    example,
    required,
    ...(options?.minimum && options?.minimum > 0 ? { minimum: options?.minimum } : {}),
    ...(options?.maximum ? { maximum: options?.maximum } : {}),
    ...(options?.defaultSize ? { default: options?.defaultSize } : {}),
    ...(options?.minLength ? { minLength: options?.minLength } : {}),
    ...(options?.maxLength ? { maxLength: options?.maxLength } : {}),
    ...(options?.isEmail ? { format: "email" } : {}),
    ...(options?.isInValues ? { enum: options.isInValues } : {}),
  };

  const decorators: PropertyDecorator[] = [ApiProperty(apiOpts)];

  if (options?.isEmail) decorators.push(IsEmail({}, { message: "Email address must be valid" }));

  if (options?.isInValues) decorators.push(IsIn(options.isInValues, options.isInValidationOptions));

  if (!required) decorators.push(IsOptional());

  return applyDecorators(...decorators);
};

const uidExample = "clp1234567890abcdef";

export const SwaggerSuccess = (required: boolean = false) =>
  buildDecorator(Boolean, "Indique si l'opération a réussi", true, {
    required,
  });
export const SwaggerCuid = (required: boolean = false) =>
  buildDecorator(String, "Identifiant unique", uidExample, { required });
export const SwaggerEmail = (required: boolean = false) =>
  buildDecorator(String, "Adresse email", "address@example.com", {
    required,
    isEmail: true,
  });
export const SwaggerPage = (
  required: boolean = false,
  minimum: number = 1,
  defaultSize: number = 1,
) =>
  buildDecorator(Number, "Page number", 42, {
    required,
    minimum,
    defaultSize,
  });
export const SwaggerLimit = (
  required: boolean = false,
  minimum: number = 1,
  maximum: number = 100,
  defaultSize: number = 20,
) =>
  buildDecorator(Number, "Items per page", 42, {
    required,
    minimum,
    maximum,
    defaultSize,
  });

export class PaginationQueryDto {
  @SwaggerPage(false)
  page?: number;
  @SwaggerLimit(false)
  limit?: number;
}
