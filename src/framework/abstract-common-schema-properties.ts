import { APD } from "./abstract-provider-definition";

export type ImportType =
  "direct" | // retrieve values before deploying and inserts them directly into the template
  "provider-based"; // import the value using proper template tools from the provider

export type ExportValue = unknown;

export interface ImportSettings {
  defaultImportType?: ImportType;
}

export type ProcessedImportSettings = Required<ImportSettings>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExportSettings {
}

export type ProcessedExportSettings = Required<ExportSettings>;

export interface DependencySettingsProperties {
  importSettings?: ImportSettings;
  exportSettings?: ExportSettings;
}

export type AbstractCommonSchemaProperties<
  D extends APD, // AbstractProviderDefinition
  > = DependencySettingsProperties;
