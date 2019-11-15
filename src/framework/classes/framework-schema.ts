import { InlineFrameworkTemplate } from "../templates";
import { ServerlessProviderName } from "../types";
import { isObject } from "../../common/type-guards";
import { CommonSchema, CommonSchemaProperties } from "./common-schema";

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

type FrameworkSchemaProperties = BaseProperties & TemplateProperties & CommonSchemaProperties;

/* eslint-disable no-dupe-class-members */

export class FrameworkSchema extends CommonSchema {
  private readonly __isFrameworkSchema = true;

  public readonly name: string;

  public readonly shortName: string;

  public readonly serviceRootDir: string;

  public readonly template: InlineFrameworkTemplate;

  constructor(schema: FrameworkSchemaProperties) {
    super(schema);

    this.name = schema.name;
    this.shortName = schema.shortName;
    this.serviceRootDir = schema.serviceRootDir;
    this.template = schema.template;
  }

  get provider(): ServerlessProviderName {
    return this.template.provider.name;
  }

  get region(): string {
    return this.template.provider.region;
  }

  public static isFrameworkSchema(value: unknown): value is FrameworkSchema {
    return isObject(value) && value.__isFrameworkSchema === true;
  }
}
