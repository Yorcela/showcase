import { Injectable } from "@nestjs/common";

import { StringValidator } from "./abstract.validator";

const CUID_MIN_LENGTH = 2;
const CUID_MAX_LENGTH = 32;
const CUID_PATTERN = /^[a-z][0-9a-z]+$/;

function isCuid(value: string): boolean {
  const length = value.length;
  return length >= CUID_MIN_LENGTH && length <= CUID_MAX_LENGTH && CUID_PATTERN.test(value);
}

@Injectable()
export class CuidValidator extends StringValidator {
  constructor() {
    super("id");
  }
  protected normalize(v: string): string {
    return (v ?? "").trim().toLowerCase();
  }
  protected override defaultReason() {
    return "Invalid id format";
  }
  protected override defaultSuggestions() {
    return ["Check cuid format"];
  }
  protected isValid(v: string): boolean {
    return isCuid(v);
  }
}
