import { InlineServiceTemplate } from "./types";

interface InlineServiceTemplateProperties {
  templateType?: "inline";
  template: InlineServiceTemplate;
}

type TemplateProperties = InlineServiceTemplateProperties;

interface BaseProperties {
  name: string;
  shortName: string;
}

export type ServiceSchemaParams = BaseProperties & TemplateProperties;

export class ServiceSchema {
  public readonly params: ServiceSchemaParams;

  constructor(params: ServiceSchemaParams) {
    this.params = params;
  }
}

export function isServiceSchema(value: any): value is ServiceSchema {
  return value instanceof ServiceSchema;
}
