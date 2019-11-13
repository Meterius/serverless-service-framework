import { InlineFrameworkTemplate } from "./framework-template";

interface InlineFrameworkTemplateProperties {
  templateType?: "inline";
  template: InlineFrameworkTemplate;
}

type TemplateProperties = InlineFrameworkTemplateProperties;

interface BaseProperties {
  name: string;
  shortName: string;

  serviceRootDir: string;
}

type FrameworkSchemaParams = BaseProperties & TemplateProperties;

export class FrameworkSchema {
  public readonly params: FrameworkSchemaParams;

  constructor(params: FrameworkSchemaParams) {
    this.params = params;
  }
}

export function isFrameworkSchema(value: any): value is FrameworkSchema {
  return value instanceof FrameworkSchema;
}

export function getInlineFrameworkTemplate(
  templateSchema: FrameworkSchema,
): InlineFrameworkTemplate {
  return templateSchema.params.template;
}
