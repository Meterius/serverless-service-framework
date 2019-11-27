/*
 *  TypeScript
 */

export type ImportType =
  "direct" | // retrieve values before deploying and inserts them directly into the template
  "provider-based"; // import the value using proper template tools from the provider

// value = string <=> { name: value } <=> { name: value; type: "provider-based" }
export type ImportValue = string | { name: string; type?: ImportType };

export type ProcessedImportValue<T extends ImportType = ImportType> = { name: string; type: T };

export interface ImportMap {
  [serviceDefaultIdentifier: string]: ImportValue[];
}

export interface ProcessedImportMap {
  [serviceDefaultIdentifier: string]: ProcessedImportValue[];
}

export type ExportValue = unknown;

export interface ExportMap {
  [exportName: string]: ExportValue;
}

export interface ImportSettings {
  defaultImportType?: ImportType;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExportSettings {
}

export interface DependencySettingsProperties {
  importSettings?: ImportSettings;
  exportSettings?: ExportSettings;
}

export type CommonSchemaProperties = DependencySettingsProperties;
