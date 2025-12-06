import { buildHexRegex, buildJwtRegex, buildEmailRegex } from "./regex-builder.utils";

describe("regex-builder.utils", () => {
  it("should build hex regex with length", () => {
    const regex = buildHexRegex(4, { global: true });
    expect(regex.flags).toContain("g");
    expect(regex.test("a1b2")).toBe(true);
    expect(regex.test("a1b2c3")).toBe(false);
  });

  it("should build jwt regex", () => {
    const regex = buildJwtRegex({ multiline: true });
    expect(regex.flags).toContain("m");
    expect(regex.test("header.payload.signature")).toBe(true);
    expect(regex.test("invalid")).toBe(false);
  });

  it("should build email regex", () => {
    const regex = buildEmailRegex({ caseInsensitive: true });
    expect(regex.flags).toContain("i");
    expect(regex.test("user@example.com")).toBe(true);
    expect(regex.test("invalid@")).toBe(false);
  });
});
