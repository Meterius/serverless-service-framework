import { InlineServiceTemplate } from "../templates";
import { isObject } from "../../common/type-guards";
import {
  CommonSchema, CommonSchemaProperties, ExportMap, ImportMap,
} from "./common-schema";
import { FrameworkSchema } from "./framework-schema";

interface InlineServiceTemplateProperties {
  templateType?: "inline";
  template: InlineServiceTemplate;
}

type TemplateProperties = InlineServiceTemplateProperties;

export interface DependencyProperties {
  importMap: ImportMap;
  exportMap: ExportMap;
}

interface BaseProperties {
  name: string;
  shortName: string;
}

type ServiceSchemaSpecificProperties = BaseProperties & TemplateProperties & DependencyProperties;

export type ServiceSchemaProperties = ServiceSchemaSpecificProperties & CommonSchemaProperties;

/* eslint-disable no-dupe-class-members */

export class ServiceSchema extends CommonSchema {
  private readonly __isServiceSchema = true;

  public readonly name: string;

  public readonly shortName: string;

  public readonly importMap: ImportMap;

  public readonly exportMap: ExportMap;

  public readonly template: InlineServiceTemplate;

  constructor(schema: ServiceSchemaProperties);

  /**
   * Special Constructor to merge common schema properties from framework schema and service schema.
   */
  constructor(frameworkSchema: FrameworkSchema, serviceSchema: ServiceSchema);

  constructor(arg0: ServiceSchemaProperties | FrameworkSchema, arg1?: ServiceSchema) {
    // this ugly piece of code is required since typescript inserts
    // class attribute initializations before the super call otherwise (i.e. __isServiceSchema)
    super(((): CommonSchemaProperties => {
      if (FrameworkSchema.isFrameworkSchema(arg0)) {
        if (ServiceSchema.isServiceSchema(arg1)) {
          return CommonSchema.merge(
            arg0, arg1,
          );
        } else {
          throw new Error("Invalid ServiceSchema Constructor Overload");
        }
      } else {
        return arg0;
      }
    })());

    let schema: ServiceSchemaProperties;

    if (FrameworkSchema.isFrameworkSchema(arg0)) {
      if (ServiceSchema.isServiceSchema(arg1)) {
        schema = arg1.extractServiceSchemaProperties();
      } else {
        throw new Error("Invalid ServiceSchema Constructor Overload");
      }
    } else {
      schema = arg0;
    }

    this.name = schema.name;
    this.shortName = schema.shortName;
    this.importMap = schema.importMap;
    this.exportMap = schema.exportMap;
    this.template = schema.template;
  }

  private extractServiceSchemaProperties(): ServiceSchemaProperties {
    return {
      name: this.name,
      shortName: this.shortName,

      importMap: this.importMap,
      exportMap: this.exportMap,

      templateType: "inline",
      template: this.template,

      ...this.extractCommonSchemaProperties(),
    };
  }

  public static isServiceSchema(value: unknown): value is ServiceSchema {
    return isObject(value) && value.__isServiceSchema === true;
  }
}
