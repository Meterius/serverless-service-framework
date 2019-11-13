import merge from "deepmerge";
import path from "path";
import fs from "fs";
import { getInlineServiceTemplate, ServiceSchema } from "./service-schema";
import { FrameworkSchema, getInlineFrameworkTemplate } from "./service-framework-schema";
import { InlineServerlessTemplate } from "./types";
import { ServiceSchemaFile } from "./schema-handling";

export function createServiceServerlessTemplate(
  frameworkSchema: FrameworkSchema,
  serviceSchema: ServiceSchema,
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
  JavaScript = "js"
}

function formatToExt(format: TemplateFormat): string {
  return format;
}

interface SerializedTemplate {
  data: string;
  format: TemplateFormat;
}

export function serializeServiceServerlessTemplate(
  template: InlineServerlessTemplate, // which template will be serialized
  format: TemplateFormat = TemplateFormat.JavaScript, // which file format will be generated
): SerializedTemplate {
  if (format === TemplateFormat.JavaScript) {
    return {
      data: `module.exports = ${JSON.stringify(template, undefined, " ")}`,
      format,
    };
  } else {
    throw new Error("Invalid Template Format");
  }
}

export function writeServiceServerlessTemplate(
  serviceFile: ServiceSchemaFile,
  serializedTemplate: SerializedTemplate,
): void {
  const slsFilePath = path.join(
    serviceFile.dirPath,
    `serverless.${formatToExt(serializedTemplate.format)}`,
  );

  fs.writeFileSync(slsFilePath, serializedTemplate.data);
}
