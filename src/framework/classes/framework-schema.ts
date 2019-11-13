import { InlineFrameworkTemplate } from "../templates";
import { ServerlessProvider } from "../types";
import { isObject } from "../../common/type-guards";
import { CommonProperties } from "../schema";

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

type FrameworkSchemaParams = BaseProperties & TemplateProperties & CommonProperties;

/* eslint-disable no-dupe-class-members */

export class FrameworkSchema {
  private readonly __isFrameworkSchema = true;

  public readonly params: FrameworkSchemaParams;

  constructor(params: FrameworkSchemaParams);

  constructor(frameworkSchema: FrameworkSchema);

  constructor(arg0: FrameworkSchemaParams | FrameworkSchema) {
    this.params = FrameworkSchema.isFrameworkSchema(arg0) ? arg0.params : arg0;
  }

  get template(): InlineFrameworkTemplate {
    return this.params.template;
  }

  get provider(): ServerlessProvider {
    return this.template.provider.name;
  }

  get region(): string {
    return this.template.provider.region;
  }

  public static isFrameworkSchema(value: unknown): value is FrameworkSchema {
    return isObject(value) && value.__isFrameworkSchema === true;
  }
}
