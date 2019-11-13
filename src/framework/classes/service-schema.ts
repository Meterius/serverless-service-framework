import deepmerge from "deepmerge";
import { InlineServiceTemplate } from "../templates";
import { isObject } from "../../common/type-guards";
import { CommonProperties, commonPropertyKeys } from "../schema";
import { FrameworkSchema } from "./framework-schema";

interface InlineServiceTemplateProperties {
  templateType?: "inline";
  template: InlineServiceTemplate;
}

type TemplateProperties = InlineServiceTemplateProperties;

interface BaseProperties {
  name: string;
  shortName: string;
}

type ServiceSpecificSchemaProperties = BaseProperties & TemplateProperties;

export type ServiceSchemaParams = ServiceSpecificSchemaProperties & CommonProperties;

/* eslint-disable no-dupe-class-members */

export class ServiceSchema {
  private readonly __isServiceSchema = true;

  public readonly params: ServiceSchemaParams;

  constructor(params: ServiceSchemaParams);

  constructor(serviceSchema: ServiceSchema);

  constructor(arg0: ServiceSchemaParams | ServiceSchema) {
    this.params = ServiceSchema.isServiceSchema(arg0) ? arg0.params : arg0;
  }

  get template(): InlineServiceTemplate {
    return this.params.template;
  }

  public static mergeFrameworkAndServiceSchema(
    frameworkSchema: FrameworkSchema, serviceSchema: ServiceSchema,
  ): ServiceSchema {
    const defaultProperties: Partial<CommonProperties> = {};

    commonPropertyKeys.forEach((key) => {
      defaultProperties[key] = frameworkSchema.params[key];
    });

    // eslint-disable-next-line max-len
    const params = deepmerge<CommonProperties, ServiceSchemaParams>(defaultProperties, serviceSchema.params);

    return new ServiceSchema(params);
  }

  public static isServiceSchema(value: unknown): value is ServiceSchema {
    return isObject(value) && value.__isServiceSchema === true;
  }
}
