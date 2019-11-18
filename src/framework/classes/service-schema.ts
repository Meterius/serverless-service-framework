import { InlineServiceTemplate } from "../templates";
import {
  CommonSchema,
  CommonSchemaProperties,
  ExportMap,
  ImportMap,
  ImportSettings,
  ImportType, ImportValue,
  ProcessedImportMap, ProcessedImportValue,
} from "./common-schema";
import { FrameworkSchema } from "./framework-schema";
import { merge } from "../../common/utility";

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

/* eslint-disable no-dupe-class-members */

export class ServiceSchema extends CommonSchema {
  private readonly __isServiceSchema = true;

  public readonly name: string;

  public readonly shortName: string;

  public readonly importMap: ProcessedImportMap;

  // list of default service identifiers of services that this service imports
  public readonly importedServices: string[];

  public readonly exportMap: ExportMap;

  public readonly template: InlineServiceTemplate;

  private readonly serviceSchema: ServiceSchemaProperties;

  constructor(frameworkSchema: FrameworkSchema, schema: ServiceSchemaProperties) {
    super(CommonSchema.merge(frameworkSchema, schema));

    this.name = schema.name;
    this.shortName = schema.shortName;

    this.importMap = ServiceSchema.processImportMap(
      schema.importMap || {}, this.importSettings,
    );

    this.importedServices = ServiceSchema.getImportedServices(this.importMap);

    this.exportMap = schema.exportMap || {};
    this.template = schema.template;

    this.serviceSchema = schema;
  }

  /**
   * Returns the default identifier.
   */
  get identifier(): string {
    return this.identifiers[0];
  }

  /**
   * Returns all possible identifiers.
   * A service is identified by multiple identifiers (name and shortName).
   * (should be used when mapping services and needs to be collision free when used with multiple
   * other service schemas)
   */
  get identifiers(): string[] {
    return [this.name, this.shortName];
  }

  private extractServiceSchemaProperties(): ServiceSchemaProperties {
    return this.serviceSchema;
  }

  /**
   * Returns whether the identifier is an identifier of this schema.
   */
  isReferredToBy(identifier: string): boolean {
    return this.identifiers.includes(identifier);
  }

  /**
   * Whether this service imports the other service.
   */
  isImporting(otherServiceSchema: ServiceSchema): boolean {
    return this.importedServices.some(
      (importedServiceIdentifier) => otherServiceSchema.isReferredToBy(importedServiceIdentifier),
    );
  }

  /**
   * Whether the other service imports this service.
   */
  isExportedTo(otherServiceSchema: ServiceSchema): boolean {
    return otherServiceSchema.importedServices.includes(this.identifier);
  }

  /**
   * Whether the import value is exported by this service
   */
  isExportingImportValue(importValue: ProcessedImportValue): boolean {
    return this.exportMap[importValue.name] !== undefined;
  }

  private static readonly defaultImportSettings: Required<ImportSettings> = {
    defaultImportType: ImportType.ProviderBased,
  };

  private static processImportMap(
    importMap: ImportMap,
    usedImportSettings: ImportSettings = {},
  ): ProcessedImportMap {
    const importSettings = merge(
      ServiceSchema.defaultImportSettings, usedImportSettings, true,
    );

    const processedImportMap: ProcessedImportMap = {};

    Object.entries(importMap).forEach(([serviceName, imports]: [string, ImportValue[]]) => {
      processedImportMap[serviceName] = imports.map((importValue): ProcessedImportValue => {
        if (typeof importValue === "string") {
          return {
            name: importValue,
            type: importSettings.defaultImportType,
          };
        } else {
          return {
            name: importValue.name,
            type: importValue.type || importSettings.defaultImportType,
          };
        }
      });
    });

    return processedImportMap;
  }

  private static getImportedServices(
    importMap: ImportMap,
  ): string[] {
    return Object.keys(importMap);
  }

  public static isServiceSchemaProperties(value: unknown): value is ServiceSchemaProperties {
    return true;
  }
}
