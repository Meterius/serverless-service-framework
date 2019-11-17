import { isObject } from "../../common/type-guards";
import { merge } from "../../common/utility";

export enum ImportType {
  // eslint-disable-next-line max-len
  Direct = "direct", // retrieve values before deploying and inserts them directly into the template
  ProviderBased = "provider-based" // import the value using proper template tools from the provider
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

export type ExportValue = string;

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

const commonSchemaPropertyMap: Required<{ [key in keyof CommonSchemaProperties]: null }> = {
  importSettings: null,
  exportSettings: null,
};

const commonSchemaPropertyKeys = Object.keys(commonSchemaPropertyMap);

/* eslint-disable no-dupe-class-members */

export class CommonSchema implements CommonSchemaProperties {
  private readonly __isCommonSchema = true;

  public readonly importSettings?: ImportSettings;

  public readonly exportSettings?: ExportSettings;

  private readonly commonSchema: CommonSchemaProperties;

  constructor(commonSchema: CommonSchemaProperties) {
    this.importSettings = commonSchema.importSettings;
    this.exportSettings = commonSchema.exportSettings;
    this.commonSchema = commonSchema;
  }

  protected extractCommonSchemaProperties(): CommonSchemaProperties {
    return this.commonSchema;
  }

  /**
   * Takes in an extension of a common schema that might have excess properties.
   * Returns new object that only has common schema properties.
   */
  private static filter(schema: CommonSchemaProperties): CommonSchemaProperties {
    const result = { ...schema };

    Object.keys(result).forEach((key) => {
      if (!commonSchemaPropertyKeys.includes(key)) {
        // @ts-ignore
        delete result[key];
      }
    });

    return result;
  }

  /**
   * Returns new object that has merged base and specific common schema properties and
   * only contains common schema properties. (i.e. excess properties will be filtered out)
   */
  static merge(
    base: CommonSchemaProperties | CommonSchema,
    specific: CommonSchemaProperties | CommonSchema,
  ): CommonSchemaProperties {
    const filteredBase = CommonSchema.filter(
      CommonSchema.isCommonSchema(base) ? base.extractCommonSchemaProperties() : base,
    );
    const filteredSpecific = CommonSchema.filter(
      CommonSchema.isCommonSchema(specific) ? specific.extractCommonSchemaProperties() : specific,
    );

    return merge(filteredBase, filteredSpecific, true);
  }

  public static isCommonSchema(value: unknown): value is CommonSchema {
    return isObject(value) && value.__isCommonSchema === true;
  }
}
