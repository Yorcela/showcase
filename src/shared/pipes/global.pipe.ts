import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { CuidPipe } from "./cuid.pipe";
import { EmailPipe } from "./email.pipe";
import { HexTokenPipe } from "./hex-token.pipe";
import { JwtPipe } from "./jwt.pipe";
import { CuidValidator } from "../validators/cuid.validator";
import { EmailValidator } from "../validators/email.validator";
import { HexTokenValidator } from "../validators/hex-token.validator";
import { JwtTokenValidator } from "../validators/jwt.validator";

@Injectable()
export class GlobalValidatorPipe implements PipeTransform {
  constructor(
    private readonly emailValidator: EmailValidator,
    private readonly cuidValidator: CuidValidator,
    private readonly jwtValidator: JwtTokenValidator,
    private readonly hexValidator: HexTokenValidator,
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    value = new EmailPipe(this.emailValidator).transform(value, metadata);
    value = new CuidPipe(this.cuidValidator).transform(value, metadata);
    value = new JwtPipe(this.jwtValidator).transform(value, metadata);
    value = new HexTokenPipe(this.hexValidator).transform(value, metadata);
    return value;
  }
}
