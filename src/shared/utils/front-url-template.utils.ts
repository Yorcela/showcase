import { Inject, Injectable } from "@nestjs/common";
import { APP_CONFIG, AppConfig } from "../modules/config/app.config";

// yorcela-web/src/app/feature/register/register.routes.ts
export enum FrontPageUrls {
  REGISTER_VERIFYEMAIL = "register/verify?token={token}&code={code}",
  RESET_PASSWORD = "auth/reset-password?token={token}",
}

@Injectable()
export class FrontUrlBuilderService {
  constructor(@Inject(APP_CONFIG) private readonly appConfig: AppConfig) {}

  buildFrontUrl(pathTemplate: FrontPageUrls, params: Record<string, string | number> = {}): string {
    let baseUrl = "";
    try {
      baseUrl = this.appConfig.getFrontendUrl() ?? "";
    } catch {
      baseUrl = "";
    }

    baseUrl = baseUrl.trim().replace(/\/+$/, "");

    let filledPath = String(pathTemplate);

    for (const [key, value] of Object.entries(params)) {
      const encoded = encodeURIComponent(String(value));
      filledPath = filledPath.replace(new RegExp(`{${key}}`, "g"), encoded);
    }

    const sanitizedPath = filledPath.replace(/^\/+/, "");

    if (!baseUrl) {
      return `/${sanitizedPath}`;
    }

    return `${baseUrl}/${sanitizedPath}`;
  }
}
