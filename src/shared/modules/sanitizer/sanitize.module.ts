import { Module } from "@nestjs/common";
import { EmailSanitizer } from "./email.sanitizer";
import { GlobalSanitizerInterceptor } from "./global.interceptor";

@Module({
  providers: [EmailSanitizer, GlobalSanitizerInterceptor],
  exports: [GlobalSanitizerInterceptor],
})
export class SanitizeModule {}
