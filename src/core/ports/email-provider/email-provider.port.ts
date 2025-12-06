export interface EmailProviderPort {
  send(email: EmailOptions): Promise<void>;
}

export const EMAIL_PROVIDER_PORT = Symbol("EMAIL_PROVIDER_PORT");

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}

export interface EmailTemplateData {
  [key: string]: any;
}
