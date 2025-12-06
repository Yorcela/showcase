export type EmailTemplateId = "auth/verify-email" | "auth/reset-password";

export interface TemplatePayloads {
  "auth/verify-email": {
    code: string;
    verificationLink: string;
    otpExpirationTime: string;
  };
}
