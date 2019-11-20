import { InlineServiceTemplate } from "../../templates.types";
import { CommonSchemaProperties, ExportMap, ImportMap } from "./common-schema.types";

/*
 *  TypeScript
 */

interface InlineServiceTemplateProperties {
  templateType?: "inline";
  template: InlineServiceTemplate;
}

type TemplateProperties = InlineServiceTemplateProperties;

export interface DependencyProperties {
  importMap?: ImportMap;
  exportMap?: ExportMap;
}

interface BaseProperties {
  name: string; // the name is used as the default service identifier
  shortName: string;
}

type ServiceSchemaSpecificProperties = BaseProperties & TemplateProperties & DependencyProperties;

export type ServiceSchemaProperties = ServiceSchemaSpecificProperties & CommonSchemaProperties;
