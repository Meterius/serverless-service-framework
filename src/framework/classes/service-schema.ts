import { InlineServiceTemplate } from "../templates.types";
import {
  ExportMap,
  ImportMap,
  ImportSettings, ImportType,
  ImportValue,
  ProcessedImportMap, ProcessedImportValue,
} from "./types/common-schema.types";
import { FrameworkSchema } from "./framework-schema";
import { merge } from "../../common/utility";
import { CommonSchema } from "./common-schema";
import { ServiceSchemaProperties } from "./types/service-schema.types";
import {
  ServiceSchemaProperties as RuntypesServiceSchemaProperties,
} from "./types/service-schema.runtypes";

/* eslint-disable no-dupe-class-members */

export class ServiceSchema extends CommonSchema {
  public readonly name: string;

  public readonly shortName: string;

  public readonly importMap: ProcessedImportMap;

  // list of default service identifiers of services that this service imports
  public readonly importedServices: string[];

  public readonly exportMap: ExportMap;

  public readonly template: InlineServiceTemplate;

  private readonly serviceSchema: ServiceSchemaProperties;

  constructor(frameworkSchema: FrameworkSchema, schema: ServiceSchemaProperties) {
    super(frameworkSchema, schema);

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
    defaultImportType: "provider-based",
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

  public static filterImportValuesByType<T extends ImportType>(
    importValues: ProcessedImportValue[], importType: T,
  ): ProcessedImportValue<T>[] {
    return importValues.filter(
      (value: ProcessedImportValue): value is ProcessedImportValue<T> => value.type === importType,
    );
  }

  public static ensureServiceSchemaProperties(value: unknown): ServiceSchemaProperties {
    return RuntypesServiceSchemaProperties.check(value);
  }
}
