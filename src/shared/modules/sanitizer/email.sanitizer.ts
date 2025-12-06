import { Injectable } from "@nestjs/common";

import { SanitizerAbstract } from "./sanitizer.abstract";

@Injectable()
export class EmailSanitizer extends SanitizerAbstract<string> {
  constructor() {
    super("email");
  }
  protected isTargetValue(v: unknown): v is string {
    return typeof v === "string";
  }
  protected sanitize(v: string): string {
    return (v ?? "").trim().toLowerCase();
  }
}
