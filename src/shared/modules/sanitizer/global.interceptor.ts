import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable, map } from "rxjs";
import { EmailSanitizer } from "./email.sanitizer";

@Injectable()
export class GlobalSanitizerInterceptor implements NestInterceptor {
  constructor(private readonly emailSanitizer: EmailSanitizer) {}

  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data || (typeof data !== "object" && !Array.isArray(data))) return data;
        this.emailSanitizer.sanitizeInObject(data, true);
        return data;
      }),
    );
  }
}
