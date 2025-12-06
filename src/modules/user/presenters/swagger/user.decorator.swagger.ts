import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

import {
  buildDecorator,
  SwaggerCuid,
  SwaggerEmail,
} from "@shared/presenters/swagger/common.decorator.swagger";

import {
  getUserRolesList,
  getUserStatusList,
  UserRole,
  UserStatus,
} from "../../domain/entities/user.entity";

const dateExample = "2024-01-01T12:00:00.000Z";
const tokenExample = "8ad25434f308977f08e406f20b68150dc3988ce9a1f82f1eca81cb5ac71d76bf";

export const SwaggerUserId = (required: boolean = false) => SwaggerCuid(required);
export const SwaggerUserEmail = (required: boolean = false) => SwaggerEmail(required);
export const SwaggerUserPassword = (required: boolean = false) =>
  buildDecorator(
    String,
    "Password (minimum 8 characters, NIST 800-63B compliant)",
    "#my$uper$3cr3tPwd#",
    { required, minLength: 8, maxLength: 128 },
  );
export const SwaggerUserHasPassword = (required: boolean = false) =>
  buildDecorator(Boolean, "Tells if a user has already a password set or not", true, { required });
export const SwaggerUserFirstName = (required: boolean = false) =>
  buildDecorator(String, "Prénom", "John", { required, maxLength: 50 });
export const SwaggerUserLastName = (required: boolean = false) =>
  buildDecorator(String, "Nom de famille", "Doe", { required, maxLength: 50 });
export const SwaggerUserPhone = (required: boolean = false) =>
  buildDecorator(String, "Numéro de téléphone (avec indicateur de pays)", "+33123456789", {
    required,
  });
export const SwaggerUserCreatedAt = (required: boolean = false) =>
  buildDecorator(Date, "Date de création", dateExample, { required });
export const SwaggerUserIsVerified = (required: boolean = false) =>
  buildDecorator(Boolean, "Indique si l'email est vérifié", true, { required });
export const SwaggerUserAccessToken = (required: boolean = false) =>
  buildDecorator(String, "Token d'accès JWT", tokenExample, { required });
export const SwaggerUserRefreshToken = (required: boolean = false) =>
  buildDecorator(String, "Token de rafraîchissement", tokenExample, {
    required,
  });
export const SwaggerUserVerificationToken = (required: boolean = false) =>
  buildDecorator(String, "Token de vérification", tokenExample, { required });
export const SwaggerUserOtpCode = (required: boolean = false) =>
  buildDecorator(String, "Code OTP", "123456", { required });
export const SwaggerUserEmailVerifiedAt = (required: boolean = false) =>
  buildDecorator(Date, "Date de vérification de l'email", dateExample, {
    required,
  });
export const SwaggerUserStatus = (required: boolean = false) =>
  buildDecorator(String, "Statut du compte", UserStatus.ACTIVE, {
    required,
    isInValues: getUserStatusList(),
    isInValidationOptions: { message: "User status must be valid" },
  });
export const SwaggerUserRole = (required: boolean = false) =>
  buildDecorator(String, "Rôle du compte", UserRole.USER, {
    required,
    isInValues: getUserRolesList(),
    isInValidationOptions: { message: "User role must be valid" },
  });

export const SwaggerUser = (required: boolean = false) =>
  applyDecorators(
    ApiProperty({
      type: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { UserResponsePayloadDto } = require("@shared/presenters/dto/user.response.dto");
        return UserResponsePayloadDto;
      },
      description: "User summary payload",
      required,
    }),
  );

export const SwaggerUsersMePayload = (required: boolean = false) =>
  applyDecorators(
    ApiProperty({
      // Lazy import to avoid circular dependency with DTO modules
      type: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { UsersMePayloadDto } = require("../dto/user.dto");
        return UsersMePayloadDto;
      },
      description: "Payload wrapper containing the authenticated user",
      required,
    }),
  );
