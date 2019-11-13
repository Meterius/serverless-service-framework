import merge from "deepmerge";
import { getInlineServiceTemplate, ServiceSchema } from "./schema/service-schema";
import { FrameworkSchema, getInlineFrameworkTemplate } from "./schema/service-framework-schema";
import { InlineServerlessTemplate } from "./types";
import { FrameworkSchemaFile, ServiceSchemaFile } from "./schema-handling";
import { serviceBuild } from "./constants";
import { writeServiceBuildFile } from "./file-handling";

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

/**
 * Writes serverless template file.
 *
 * Returns absolute file path of written file.
 */
export async function writeServiceServerlessTemplate(
  serviceSchemaFile: ServiceSchemaFile,
  serializedTemplate: SerializedTemplate,
): Promise<string> {
  return writeServiceBuildFile(
    serviceSchemaFile.dirPath,
    `${serviceBuild.serverlessTemplate}.${formatToExt(serializedTemplate.format)}`,
    serializedTemplate.data,
  );
}

/**
 * Builds serverless template file and writes it.
 *
 * Returns absolute file path of written serverless template file.
 */
export async function buildServiceServerlessTemplate(
  frameworkSchemaFile: FrameworkSchemaFile,
  serviceSchemaFile: ServiceSchemaFile,
): Promise<string> {
  const template = createServiceServerlessTemplate(
    frameworkSchemaFile.schema, serviceSchemaFile.schema,
  );
  const serTemp = serializeServiceServerlessTemplate(template, TemplateFormat.JavaScript);

  return writeServiceServerlessTemplate(
    serviceSchemaFile,
    serTemp,
  );
}
