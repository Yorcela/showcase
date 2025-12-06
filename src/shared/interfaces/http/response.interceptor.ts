import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AppResponse } from "./response.type";
import { SKIP_APP_RESPONSE } from "./skip-response.decorator";

@Injectable()
export class AppResponseInterceptor<T> implements NestInterceptor<T, AppResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<AppResponse<T>> {
    const isHttp = ctx.getType() === "http";
    if (!isHttp) return next.handle() as any;

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_APP_RESPONSE, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (skip) return next.handle() as any;

    return next.handle().pipe(
      map((data: any) => {
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          (data.success === true || data.success === false)
        )
          return data;
        return { success: true, data };
      }),
    );
  }
}
