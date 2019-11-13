import { InlineServiceTemplate } from "../templates";
import { isObject } from "../../common/utility";

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

  public static isServiceSchema(value: unknown): value is ServiceSchema {
    return isObject(value) && value.__isServiceSchema === true;
  }
}
