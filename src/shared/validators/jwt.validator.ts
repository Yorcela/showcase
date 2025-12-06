import { Injectable } from "@nestjs/common";

import { StringValidator } from "./abstract.validator";
import { buildJwtRegex } from "../utils/regex-builder.utils";

@Injectable()
export class JwtTokenValidator extends StringValidator {
  constructor() {
    super("jwt");
  }

  protected normalize(v: string): string {
    return (v ?? "").trim();
  }

  protected override defaultReason() {
    return "Invalid JWT format";
  }

  protected override defaultSuggestions() {
    return ["Check JWT format"];
  }

  protected isValid(v: string): boolean {
    return buildJwtRegex().test(this.normalize(v));
  }
}
