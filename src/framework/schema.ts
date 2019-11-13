export enum ImportType {
  // eslint-disable-next-line max-len
  // Direct = "direct", // retrieve values before deploying and insert them directly into the template
  ProviderBased = "provider-based" // import the value using proper template tools from the provider
}

// value = string <=> { name: value } <=> { name: value; type: "provider-based" }
export type ImportValue = string | { name: string; type?: ImportType };

export interface ImportMap {
  [serviceName: string]: ImportValue[];
}

export type ExportValue = string;

export interface ExportMap {
  [exportName: string]: ExportValue;
}

export interface ImportSettings {
  defaultImportType?: ImportType;
  useNamespaceImportVariables?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExportSettings {
}

export interface DependencySettingsProperties {
  importSettings?: ImportSettings;
  exportSettings?: ExportSettings;
}

export interface DependencyProperties {
  import: ImportMap;
  export: ExportMap;
}

export type CommonProperties = DependencySettingsProperties;

const commonPropertyMap: Required<{ [key in keyof CommonProperties]: null }> = {
  importSettings: null,
  exportSettings: null,
};

export const commonPropertyKeys = Object.keys(commonPropertyMap) as (keyof CommonProperties)[];
