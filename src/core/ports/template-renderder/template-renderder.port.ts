import { Dictionnary } from "@apptypes/dictionnary.type";

export interface TemplateRendererPort {
  render(
    template: string,
    data: Dictionnary,
    locale?: string,
  ): Promise<{ html: string; subject: string; text?: string }>;
}

export const TEMPLATE_RENDERER_PORT = Symbol("TEMPLATE_RENDERER_PORT");
