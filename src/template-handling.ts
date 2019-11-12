import merge from "deepmerge";
import { getInlineServiceTemplate, ServiceSchema } from "./service-schema";
import { FrameworkSchema, getInlineFrameworkTemplate } from "./service-framework-schema";
import { InlineServerlessTemplate } from "./types";

export function createServiceServerlessTemplate(
  serviceSchema: ServiceSchema, frameworkSchema: FrameworkSchema,
): InlineServerlessTemplate {
  const serviceTemplate = getInlineServiceTemplate(serviceSchema);
  const frameworkTemplate = getInlineFrameworkTemplate(frameworkSchema);

  const template: InlineServerlessTemplate = merge.all([
    frameworkTemplate,
    serviceTemplate,
    {
      service: {
        name: `${frameworkSchema.params.shortName}-${serviceSchema.params.shortName}`,
      },
    },
  ]);

  return template;
}

enum TemplateFormat {
  JS = "js"
}

export function serializeServiceServerlessTemplate(
  template: InlineServerlessTemplate, // which template will be serialized
  format: TemplateFormat = TemplateFormat.JS, // which file format will be generated
): string {
  if (format === TemplateFormat.JS) {
    return `module.exports = ${JSON.stringify(template, undefined, " ")}`;
  } else {
    throw new Error("Invalid Template Format");
  }
}
