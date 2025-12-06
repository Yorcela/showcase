import { Injectable } from "@nestjs/common";

import { StringValidator } from "./abstract.validator";
import { buildHexRegex } from "../utils/regex-builder.utils";

@Injectable()
export class HexTokenValidator extends StringValidator {
  constructor() {
    super("token");
  }
  protected normalize(v: string): string {
    return (v ?? "").trim().toLowerCase();
  }
  protected override defaultReason() {
    return "Invalid Hex Token format";
  }
  protected override defaultSuggestions() {
    return ["Check Hex Token format"];
  }
  protected isValid(v: string): boolean {
    return buildHexRegex(64).test(this.normalize(v));
  }
}
