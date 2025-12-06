import { buildDecorator } from "@shared/presenters/swagger/common.decorator.swagger";

export const SwaggerUserLoginRememberMe = (required: boolean = false) =>
  buildDecorator(Boolean, "Allonger la durée de la session à 90 jours", "true", { required });
