import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Cuid2 } from "@apptypes/cuid2.type";

export type CurrentUserPayload = { userId: Cuid2; sessionId: Cuid2; issuedAt: number };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
