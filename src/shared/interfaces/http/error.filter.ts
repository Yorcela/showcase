import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const body = ctx.getRequest().body;
    this.logger.error({ ctx, exception });

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse() as any;
      const message =
        typeof resp === "string" ? resp : (resp?.message ?? resp?.error ?? exception.message);
      const code = (resp?.code as string) || "HTTP_ERROR";
      const context = resp?.context;
      // const { error, ...context } = resp?.context;

      return res.status(status).json({ success: false, error: { code, message, body, context } });
    }

    const anyErr = exception as any;
    const code = anyErr?.code ?? "INTERNAL_ERROR";
    const message = anyErr?.message ?? "Internal server error";
    const context = anyErr?.context;
    // const { error, ...context } = anyErr?.context;

    const status = Number(anyErr?.httpStatus) || HttpStatus.INTERNAL_SERVER_ERROR;
    return res.status(status).json({ success: false, error: { code, message, body, context } });
  }
}
