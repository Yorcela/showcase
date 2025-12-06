import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfig } from "@shared/modules/config/app.config";
import { Cuid2 } from "@apptypes/cuid2.type";

export interface JwtPayload {
  sub: Cuid2;
  sid: Cuid2;
  iat: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(appConfig: AppConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfig.getJwtSecret(),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      sessionId: payload.sid,
      issuedAt: payload.iat,
    };
  }
}
