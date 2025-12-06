import { Injectable } from "@nestjs/common";

import { StringValidator } from "./abstract.validator";
import { buildEmailRegex } from "../utils/regex-builder.utils";

@Injectable()
export class EmailValidator extends StringValidator {
  constructor() {
    super("email");
  }
  protected normalize(v: string): string {
    return (v ?? "").trim().toLowerCase();
  }
  protected override defaultReason() {
    return "Invalid email format";
  }
  protected override defaultSuggestions() {
    return ["Check email format"];
  }
  protected isValid(v: string): boolean {
    return buildEmailRegex().test(this.normalize(v));
  }
}
