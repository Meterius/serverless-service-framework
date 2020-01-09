import {
  APD, BaseParameter, CommonSchema, FrameworkSchema,
  ServiceSchema, ServiceSchemaProperties,
} from "./abstract-provider-definition";
import { ServiceTemplate } from "./templates";
import {
  ExportMap, ImportMap, ImportValue,
  ProcessedImportMap,
  ProcessedImportValue,
} from "./abstract-service-schema-properties";
import {
  ImportSettings,
  ImportType,
  ProcessedImportSettings,
} from "./abstract-common-schema-properties";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractServiceSchema<
  D extends APD,
> extends AbstractBase<D> {
  readonly name: string;

  readonly shortName: string;

  readonly importMap: ProcessedImportMap;

  readonly exportMap: ExportMap;

  readonly template: ServiceTemplate;

  readonly commonSchema: CommonSchema<D>;

  private readonly props: ServiceSchemaProperties<D>;

  protected constructor(
    base: BaseParameter<D>,
    frameworkSchema: FrameworkSchema<D>,
    props: ServiceSchemaProperties<D>,
  ) {
    super(base);

    this.commonSchema = new this.classes.CommonSchema(frameworkSchema.commonSchema, props);

    this.name = props.name;
    this.shortName = props.shortName;
    this.props = props;

    this.importMap = AbstractServiceSchema.processImportMap(
      props.importMap || {}, this.commonSchema.importSettings,
    );

    this.exportMap = props.exportMap || {};
    this.template = props.template;
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

  /*
   * Returns default service identifier for all services that are imported by this service schema.
   */
  get importedServices(): string[] {
    return this.importedServicesFilteredByType();
  }

  /**
   * Returns default service identifier for all services that are imported by this service schema,
   * if they import some value via the specified importType, if importType is unspecified then
   * as long as they import anything they are listed.
   * @param importType
   */
  importedServicesFilteredByType(importType?: ImportType): string[] {
    return AbstractServiceSchema.getImportedServices(
      this.importMap, importType,
    );
  }

  /**
   * Returns whether the identifier is an identifier of this schema.
   */
  isReferredToBy(identifier: string): boolean {
    return this.identifiers.includes(identifier);
  }

  /**
   * Returns whether this service imports the other service.
   * If the importType is specified it will only return true if the
   * other service has an import that uses the given import type.
   */
  isImporting(otherServiceSchema: ServiceSchema<D>, importType?: ImportType): boolean {
    return this.importedServicesFilteredByType(importType).some(
      (importedServiceIdentifier) => otherServiceSchema.isReferredToBy(importedServiceIdentifier),
    );
  }

  /**
   * Whether the other service imports this service.
   */
  isExportedTo(otherServiceSchema: ServiceSchema<D>): boolean {
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
    usedImportSettings: ProcessedImportSettings,
  ): ProcessedImportMap {
    const processedImportMap: ProcessedImportMap = {};

    Object.entries(importMap).forEach(([serviceName, imports]: [string, ImportValue[]]) => {
      processedImportMap[serviceName] = imports.map((importValue): ProcessedImportValue => {
        if (typeof importValue === "string") {
          return {
            name: importValue,
            type: usedImportSettings.defaultImportType,
          };
        } else {
          return {
            name: importValue.name,
            type: importValue.type || usedImportSettings.defaultImportType,
          };
        }
      });
    });

    return processedImportMap;
  }

  private static getImportedServices(
    importMap: ProcessedImportMap,
    importType?: ImportType,
  ): string[] {
    const importedServices = Object.keys(importMap);

    return importType === undefined ? importedServices : importedServices.filter(
      (key) => importMap[key].some(
        (importValue) => importValue.type === importType,
      ),
    );
  }

  static filterImportValuesByType<T extends ImportType>(
    importValues: ProcessedImportValue[], importType: T,
  ): ProcessedImportValue<T>[] {
    return importValues.filter(
      (value: ProcessedImportValue): value is ProcessedImportValue<T> => value.type === importType,
    );
  }
}
