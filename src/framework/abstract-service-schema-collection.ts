import * as graphlib from "graphlib";
import { APD, BaseParameter, ServiceSchema } from "./abstract-provider-definition";
import { ProcessedImportMap, ProcessedImportValue } from "./abstract-service-schema-properties";
import { flat, fromEntries, mapObject } from "../common/utility";
import { AbstractBase } from "./abstract-base";

export class AbstractServiceSchemaCollection<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  readonly schemas: ServiceSchema<D>[];

  readonly usedDefaultIdentifiers: string[];

  readonly usedIdentifiers: string[];

  constructor(
    base: BaseParameter<D>,
    schemas: ServiceSchema<D>[],
  ) {
    super(base);

    this.schemas = schemas;
    this.usedIdentifiers = this.computeIdentifiers(schemas);
    this.usedDefaultIdentifiers = this.computeDefaultIdentifiers(schemas);
  }

  // eslint-disable-next-line class-methods-use-this
  isServiceImportExportedByAnotherService(
    schemas: ServiceSchema<D>[],
    importKey: string, // aka imported service identifier
    importValue: ProcessedImportValue,
  ): boolean {
    return schemas.some(
      (schema) => schema.isReferredToBy(importKey) && schema.isExportingImportValue(importValue),
    );
  }

  doesServiceHaveDuplicateIdentifiers(schema: ServiceSchema<D>): boolean {
    return schema.identifiers.some((id: string) => this.schemas.some(
      (otherSchema) => otherSchema !== schema && otherSchema.identifiers.includes(id),
    ));
  }

  getServicesWithoutUniqueIdentifiers(): ServiceSchema<D>[] {
    return this.schemas.filter(
      (schema) => this.doesServiceHaveDuplicateIdentifiers(schema),
    );
  }

  getServiceImportsUsingNonExistentIdentifiers(
  ): ({ schema: ServiceSchema<D>; nonExistentIdentifiersUsed: string[] })[] {
    return this.schemas.map((inspectedSchema) => ({
      schema: inspectedSchema,
      nonExistentIdentifiersUsed: inspectedSchema.importedServices.filter(
        (id: string) => !this.usedIdentifiers.includes(id),
      ),
    }));
  }

  getServiceImportsUsingNonDefaultIdentifier(
  ): ({ schema: ServiceSchema<D>; nonDefaultIdentifiersUsed: string[] })[] {
    return this.schemas.map((inspectedSchema) => ({
      schema: inspectedSchema,
      nonDefaultIdentifiersUsed: inspectedSchema.importedServices.filter(
        (id: string) => !this.usedDefaultIdentifiers.includes(id),
      ),
    }));
  }

  getServiceImportsUsingSameName(
  ): ({ schema: ServiceSchema<D>; importsUsingSameName: [string, ProcessedImportValue][] })[] {
    return this.schemas.map((inspectedSchema) => {
      const importNameMap: Record<string, [string, ProcessedImportValue][]> = {};

      Object.entries(inspectedSchema.importMap).forEach(
        ([importedServiceName, importValues]: [string, ProcessedImportValue[]]) => {
          importValues.forEach((importedValue: ProcessedImportValue) => {
            const entry: [string, ProcessedImportValue] = [importedServiceName, importedValue];
            const currentEntries: [string, ProcessedImportValue][] = importNameMap[importedValue.name] ?? [];

            importNameMap[importedValue.name] = currentEntries.concat([entry]);
          });
        },
      );

      return {
        schema: inspectedSchema,
        importsUsingSameName: flat(Object.values(importNameMap).filter((entries) => entries.length > 1)),
      };
    });
  }

  getServiceImportsNotExportedByTheOtherServices(
  ): ({ schema: ServiceSchema<D>; notExportedImportsMap: ProcessedImportMap })[] {
    return this.schemas.map((inspectedSchema) => {
      // maps each importMap such that the values are the ones not exported by another service
      const notExportedImportsMap = mapObject(inspectedSchema.importMap, (
        importValues: ProcessedImportValue[],
        importedServiceIdentifier: string,
      ) => importValues.filter(
        (importValue) => !this.isServiceImportExportedByAnotherService(
          this.schemas, importedServiceIdentifier, importValue,
        ),
      ));

      return {
        schema: inspectedSchema,
        notExportedImportsMap,
      };
    });
  }

  getCyclicImportChains(): (ServiceSchema<D>[])[] {
    const g = new graphlib.Graph({ directed: true });

    const nodeMap = fromEntries(this.schemas.map((schema) => [schema.identifier, schema]));

    g.setNodes(Object.keys(nodeMap));

    this.schemas.forEach((schema) => {
      schema.importedServices.forEach((importedServiceIdentifier: string) => {
        g.setEdge(schema.identifier, importedServiceIdentifier);
      });
    });

    return graphlib.alg.findCycles(g).map((cycle) => cycle.map(
      (serviceIdentifier) => nodeMap[serviceIdentifier],
    ));
  }

  // eslint-disable-next-line class-methods-use-this
  private computeIdentifiers(schemas: ServiceSchema<D>[]): string[] {
    return schemas.reduce<string[]>(
      (prev, schema) => prev.concat(schema.identifiers), [],
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private computeDefaultIdentifiers(schemas: ServiceSchema<D>[]): string[] {
    return schemas.map((schema) => schema.identifier);
  }
}
