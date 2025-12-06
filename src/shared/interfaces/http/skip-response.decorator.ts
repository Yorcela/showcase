import { SetMetadata } from "@nestjs/common";

export const SKIP_APP_RESPONSE = "skip_app_response";
export const SkipAppResponse = () => SetMetadata(SKIP_APP_RESPONSE, true);
