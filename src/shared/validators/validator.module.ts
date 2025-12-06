import { Module } from "@nestjs/common";

import { CuidValidator } from "./cuid.validator";
import { EmailValidator } from "./email.validator";
import { HexTokenValidator } from "./hex-token.validator";
import { JwtTokenValidator } from "./jwt.validator";
import { CuidPipe } from "../pipes/cuid.pipe";
import { EmailPipe } from "../pipes/email.pipe";
import { GlobalValidatorPipe } from "../pipes/global.pipe";
import { HexTokenPipe } from "../pipes/hex-token.pipe";
import { JwtPipe } from "../pipes/jwt.pipe";

@Module({
  providers: [
    // validators
    EmailValidator,
    CuidValidator,
    JwtTokenValidator,
    HexTokenValidator,
    // pipes
    EmailPipe,
    CuidPipe,
    JwtPipe,
    HexTokenPipe,
    // orchestrateur
    GlobalValidatorPipe,
  ],
  exports: [
    // si d'autres modules en ont besoin :
    EmailValidator,
    CuidValidator,
    JwtTokenValidator,
    HexTokenValidator,
    EmailPipe,
    CuidPipe,
    JwtPipe,
    HexTokenPipe,
    GlobalValidatorPipe,
  ],
})
export class ValidatorModule {}
