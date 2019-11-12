export interface InlineFrameworkTemplate {
  // framework template cannot have the service name specified
  service?: {
    name?: never;
    [key: string]: any;
  };

  provider: {
    // framework requires a provider and region used for all services by default
    // note that provider name cannot be overwritten by service templates
    name: "aws"; // currently only aws is supported
    region: string;

    stage?: never; // cannot set stage in template
    stackName?: never; // cannot be used, since services cannot share a stack name

    [key: string]: any;
  };

  [key: string]: any;
}

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
