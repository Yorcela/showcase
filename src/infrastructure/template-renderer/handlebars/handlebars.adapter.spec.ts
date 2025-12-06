import * as fs from "fs";
import { join } from "path";

import { Logger } from "@nestjs/common";
import * as Handlebars from "handlebars";

import { AppConfig } from "@shared/modules/config/app.config";

import { EmailTemplateHandlebarsRenderer } from "./handlebars.adapter";

type MockFsModule = {
  __setMockFiles: (files: Record<string, string>) => void;
  readFileSync: jest.Mock;
  existsSync: jest.Mock;
};

jest.mock("fs", () => {
  let files = new Map<string, string>();
  return {
    __setMockFiles: (entries: Record<string, string>) => {
      files = new Map<string, string>(Object.entries(entries));
    },
    readFileSync: jest.fn((path: string) => {
      if (!files.has(path)) {
        const err = new Error(`ENOENT: ${path}`);
        (err as any).code = "ENOENT";
        throw err;
      }
      return files.get(path)!;
    }),
    existsSync: jest.fn((path: string) => files.has(path)),
  };
});

const fsMock = fs as unknown as MockFsModule;

describe("EmailTemplateHandlebarsRenderer", () => {
  const cwd = process.cwd();
  const partialsRoot = join(cwd, "src", "shared", "modules", "email", "partials");
  const partialsLocalesRoot = join(partialsRoot, "locales");
  const templateDir = join(cwd, "src", "modules", "auth", "emails", "templates", "verify-email");

  const basePartials = {
    [join(partialsRoot, "layout.hbs")]: "{{{body}}}",
    [join(partialsRoot, "_base-style.hbs")]: "",
    [join(partialsRoot, "_button.hbs")]: "",
    [join(partialsRoot, "_header.hbs")]: "",
    [join(partialsRoot, "_footer.hbs")]: "",
  };

  const setFiles = (extra: Record<string, string>) =>
    fsMock.__setMockFiles({
      ...basePartials,
      ...extra,
    });

  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const makeRenderer = (
    defaultLang = "en",
    suppEmail = "support@example.com",
    url = "https://app.example.com",
  ) =>
    new EmailTemplateHandlebarsRenderer({
      getAppDefaultLanguage: jest.fn().mockReturnValue(defaultLang),
      getEmailSupport: jest.fn().mockReturnValue(suppEmail),
      getFrontendUrl: jest.fn().mockReturnValue(url),
    } as unknown as AppConfig);

  it("should render template with locale resources and computed text", async () => {
    // Given
    setFiles({
      [join(templateDir, "template.hbs")]:
        "<p>{{code}} {{verificationLink}} {{emailSupport}} {{frontUrl}}</p>",
      [join(templateDir, "i18n", "en.json")]:
        '{"verify-email":{"subject":"Verify {{code}} for {{lang}}"}}',
      [join(partialsLocalesRoot, "en.json")]:
        '{"verify-email":{"subject":"Fallback {{code}}"},"unused":"value"}',
    });

    const renderer = makeRenderer();
    expect(typeof Handlebars.helpers["t"]).toBe("function");

    // When
    const result = await renderer.render("auth/verify-email", {
      code: "ABC123",
      verificationLink: "https://verify",
    });

    // Then
    expect(result.html).toContain(
      "ABC123 https://verify support@example.com https://app.example.com",
    );
    expect(result.text).toBe("ABC123 https://verify support@example.com https://app.example.com");
    expect(result.subject).toBe("Verify ABC123 for en");
  });

  it("should cache compiled templates and reuse without re-reading files", async () => {
    // Given
    const templatePath = join(templateDir, "template.hbs");
    setFiles({
      [templatePath]: "<span>{{code}}</span>",
      [join(templateDir, "i18n", "en.json")]: '{"verify-email":{"subject":"Subject {{code}}"}}',
      [join(partialsLocalesRoot, "en.json")]: "{}",
    });
    const renderer = makeRenderer();

    // When
    await renderer.render("auth/verify-email", { code: "ONE" });
    fsMock.readFileSync.mockClear();
    await renderer.render("auth/verify-email", { code: "TWO" });

    // Then
    const templateReads = fsMock.readFileSync.mock.calls
      .map(([path]) => path)
      .filter((path) => path === templatePath).length;
    expect(templateReads).toBe(0);
  });

  it("should fallback to partials translation when template subject missing", async () => {
    setFiles({
      [join(templateDir, "template.hbs")]: "<p>{{code}}</p>",
      [join(templateDir, "i18n", "en.json")]: "{}",
      [join(partialsLocalesRoot, "en.json")]:
        '{"verify-email":{"subject":"Partial {{code}} for {{lang}}"}}',
    });
    const renderer = makeRenderer();

    const result = await renderer.render("auth/verify-email", { code: "XYZ" });

    expect(result.subject).toBe("Partial XYZ for en");
  });

  it("should fallback to template code when no translation found", async () => {
    setFiles({
      [join(templateDir, "template.hbs")]: "<p>{{code}}</p>",
      [join(templateDir, "i18n", "en.json")]: "{}",
      // partials locales file intentionally missing
    });
    const renderer = makeRenderer();

    const result = await renderer.render("auth/verify-email", { code: "XYZ" });

    expect(result.subject).toBe("auth/verify-email");
  });

  it("should ignore invalid locale json gracefully", async () => {
    setFiles({
      [join(templateDir, "template.hbs")]: "<p>{{code}}</p>",
      [join(templateDir, "i18n", "en.json")]: '{"verify-email":{"subject":"Subject {{code}}"}}',
      [join(partialsLocalesRoot, "en.json")]: "{invalid json",
    });
    const renderer = makeRenderer();

    const result = await renderer.render("auth/verify-email", { code: "XYZ" });

    expect(result.subject).toBe("Subject XYZ");
  });

  it("should throw when template code is invalid", async () => {
    // Given
    setFiles(basePartials);
    const renderer = makeRenderer();

    // When / Then
    await expect(renderer.render("invalid-code", {})).rejects.toThrow(
      'Invalid template code: "invalid-code" (expected "feature/code")',
    );
  });

  it("should log and throw when template file is missing", async () => {
    // Given
    setFiles(basePartials);
    const renderer = makeRenderer();
    // When / Then
    await expect(renderer.render("auth/verify-email", {})).rejects.toThrow(/Template not found/);
    expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Template not found"));
  });

  it("should resolve helper translations with template, partials and fallback", () => {
    const helper = Handlebars.helpers["t"];
    const optionsTemplate = {
      hash: { lang: "fr", name: "Alice" },
      data: {
        root: {
          lang: "en",
          name: "Bob",
          __i18n__: {
            template: { greeting: "Bonjour {{name}} ({{lang}})" },
            partials: {},
          },
        },
      },
    };

    const fromTemplate = helper("greeting", optionsTemplate);
    expect(fromTemplate).toBe("Bonjour Alice (fr)");

    const optionsPartial = {
      hash: {},
      data: {
        root: {
          __i18n__: {
            template: {},
            partials: { greeting: "Salut {{name}}" },
          },
          name: "Carla",
        },
      },
    };

    const fromPartial = helper("greeting", optionsPartial);
    expect(fromPartial).toBe("Salut Carla");

    const fallback = helper("missing.key", {
      hash: {},
      data: { root: { __i18n__: { template: {}, partials: {} } } },
    });
    expect(fallback).toBe("missing.key");
  });
});
