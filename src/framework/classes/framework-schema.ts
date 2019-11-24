import { InlineFrameworkTemplate, ServerlessProviderName } from "../templates.types";
import { CommonSchema } from "./common-schema";
import { FrameworkSchemaProperties } from "./types/framework-schema.types";

/* eslint-disable no-dupe-class-members */

export class FrameworkSchema extends CommonSchema {
  public readonly name: string;

  public readonly shortName: string;

  public readonly serviceRootDir: string;

  public readonly tsconfigPath: string | undefined;

  public readonly template: InlineFrameworkTemplate;

  constructor(schema: FrameworkSchemaProperties) {
    super(schema);

    this.name = schema.name;
    this.shortName = schema.shortName;
    this.serviceRootDir = schema.serviceRootDir;
    this.tsconfigPath = schema.tsconfigPath;
    this.template = schema.template;
  }

  get provider(): ServerlessProviderName {
    return this.template.provider.name;
  }

  get region(): string {
    return this.template.provider.region;
  }

  public static ensureFrameworkSchemaProperties(value: unknown): FrameworkSchemaProperties {
    return value as FrameworkSchemaProperties;
  }
}
