import { readFileSync, existsSync } from "fs";
import { join } from "path";

import { Inject, Injectable, Logger } from "@nestjs/common";
import * as Handlebars from "handlebars";

import { TemplateRendererPort } from "@ports/template-renderder/template-renderder.port";

import { APP_CONFIG, AppConfig } from "@shared/modules/config/app.config";

import { Dictionnary } from "@apptypes/dictionnary.type";

function loadJsonSafe(path: string): Dictionnary {
  try {
    if (!existsSync(path)) return {};
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw) as Dictionnary;
  } catch {
    return {};
  }
}

function deepGet(obj: Dictionnary, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as any)) {
      return (acc as any)[part];
    }
    return undefined;
  }, obj);
}

function interpolateString(template: string, vars: Dictionnary): string {
  const tpl = Handlebars.compile(template);
  return tpl(vars as any);
}

@Injectable()
export class EmailTemplateHandlebarsRenderer implements TemplateRendererPort {
  private readonly logger = new Logger(EmailTemplateHandlebarsRenderer.name);
  private readonly modulesRoot = join(process.cwd(), "src", "modules");
  private readonly partialsRoot = join(
    process.cwd(),
    "src",
    "shared",
    "modules",
    "email",
    "partials",
  );
  private readonly partialsLocalesRoot = join(this.partialsRoot, "locales");
  private readonly cache = new Map<string, HandlebarsTemplateDelegate>();
  private readonly globals: Dictionnary = {};

  constructor(@Inject(APP_CONFIG) private readonly appConfig: AppConfig) {
    this.registerPartials();
    this.registerHelpers();
    this.initGlobals();
  }

  async render(
    templateCode: string,
    data: Dictionnary,
    locale?: string,
  ): Promise<{ html: string; subject: string; text?: string }> {
    const tpl = this.getOrCompile(templateCode);
    const { code, templateDir } = this.resolveTemplatePaths(templateCode);
    const lang = String(
      locale ?? data["lang"] ?? this.appConfig.getAppDefaultLanguage(),
    ).toLowerCase();
    const templateI18n = loadJsonSafe(join(templateDir, "i18n", `${lang}.json`));
    const partialsI18n = loadJsonSafe(join(this.partialsLocalesRoot, `${lang}.json`));

    const context = {
      ...this.globals,
      ...data,
      lang,
      __i18n__: {
        template: templateI18n,
        partials: partialsI18n,
      },
    };

    const html = tpl(context as any);
    const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const subjectKey = `${code}.subject`;
    const subjectFromTemplate = deepGet(templateI18n, subjectKey);
    const subjectFromPartials = deepGet(partialsI18n, subjectKey);
    const rawSubject =
      (typeof subjectFromTemplate === "string" && subjectFromTemplate) ||
      (typeof subjectFromPartials === "string" && subjectFromPartials) ||
      templateCode;
    const subject = interpolateString(rawSubject, context);

    return { html, subject, text };
  }

  private resolveTemplatePaths(templateCode: string) {
    const [feature, code] = templateCode.split("/");
    if (!feature || !code) {
      throw new Error(`Invalid template code: "${templateCode}" (expected "feature/code")`);
    }
    const templateDir = join(this.modulesRoot, feature, "emails", "templates", code);
    const templateFile = join(templateDir, "template.hbs");
    return { feature, code, templateDir, templateFile };
  }

  private getOrCompile(templateCode: string): HandlebarsTemplateDelegate {
    const cached = this.cache.get(templateCode);
    if (cached) return cached;

    const { templateFile } = this.resolveTemplatePaths(templateCode);

    let source: string;
    try {
      source = readFileSync(templateFile, "utf-8");
    } catch {
      const msg = `Template not found: ${templateFile}`;
      this.logger.error(msg);
      throw new Error(msg);
    }

    const compiled = Handlebars.compile(source);
    this.cache.set(templateCode, compiled);
    return compiled;
  }

  private initGlobals() {
    this.globals["emailSupport"] = this.appConfig.getEmailSupport();
    this.globals["frontUrl"] = this.appConfig.getFrontendUrl();
  }

  private registerPartials() {
    const read = (p: string) => readFileSync(p, "utf-8");
    Handlebars.registerPartial("layout", read(join(this.partialsRoot, "layout.hbs")));
    Handlebars.registerPartial("base-style", read(join(this.partialsRoot, "_base-style.hbs")));
    Handlebars.registerPartial("button", read(join(this.partialsRoot, "_button.hbs")));
    Handlebars.registerPartial("header", read(join(this.partialsRoot, "_header.hbs")));
    Handlebars.registerPartial("footer", read(join(this.partialsRoot, "_footer.hbs")));
  }

  private registerHelpers() {
    Handlebars.registerHelper("t", (key: string, options: any) => {
      const hash = options?.hash ?? {};
      const root = options?.data?.root ?? {};
      const lang = (hash.lang || root.lang || this.appConfig.getAppDefaultLanguage()) as string;
      const i18n = (root.__i18n__ ?? {}) as { template?: Dictionnary; partials?: Dictionnary };

      const fromTemplate = deepGet(i18n.template ?? {}, key);
      const fromPartials = deepGet(i18n.partials ?? {}, key);
      const raw =
        (typeof fromTemplate === "string" && fromTemplate) ||
        (typeof fromPartials === "string" && fromPartials) ||
        key;

      return interpolateString(raw, { ...root, ...hash, lang });
    });
  }
}
