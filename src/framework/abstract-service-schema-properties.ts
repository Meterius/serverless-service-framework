import { ServiceTemplate } from "./templates";
import { APD, CommonSchemaProperties } from "./abstract-provider-definition";
import { ExportValue, ImportType } from "./abstract-common-schema-properties";

interface TemplateProperties {
  template: ServiceTemplate;
}

export interface ExportMap {
  [exportName: string]: ExportValue;
}

// value = string <=> { name: value } <=> { name: value; type: "provider-based" }
export type ImportValue = string | { name: string; type?: ImportType };

export type ProcessedImportValue<T extends ImportType = ImportType> = { name: string; type: T };

export interface ImportMap {
  [serviceDefaultIdentifier: string]: ImportValue[];
}

export interface ProcessedImportMap {
  [serviceDefaultIdentifier: string]: ProcessedImportValue[];
}

export interface DependencyProperties {
  importMap?: ImportMap;
  exportMap?: ExportMap;
}

interface BaseProperties {
  name: string; // the name is used as the default service identifier
  shortName: string;
}

type ServiceSchemaSpecificProperties = BaseProperties & TemplateProperties & DependencyProperties;

export type AbstractServiceSchemaProperties<
  D extends APD, // AbstractProviderDefinition
> = ServiceSchemaSpecificProperties & CommonSchemaProperties<D>;
