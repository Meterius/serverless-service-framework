import * as graphlib from "graphlib";
import { ServiceSchema } from "./service-schema";
import { ProcessedImportMap, ProcessedImportValue } from "./common-schema";
import { fromEntries, mapObject } from "../../common/utility";

export class ServiceSchemaCollection {
  public readonly schemas: ServiceSchema[];

  public readonly usedDefaultIdentifiers: string[];

  public readonly usedIdentifiers: string[];

  public readonly duplicatedIdentifiers: string[];

  constructor(schemas: ServiceSchema[]) {
    this.schemas = schemas;
    this.usedIdentifiers = ServiceSchemaCollection.computeIdentifiers(schemas);
    this.usedDefaultIdentifiers = ServiceSchemaCollection.computeDefaultIdentifiers(schemas);
    this.duplicatedIdentifiers = ServiceSchemaCollection.computeDuplicatedIdentifiers(
      this.usedIdentifiers,
    );
  }

  public static isServiceImportExportedByAnotherService(
    schemas: ServiceSchema[],
    importKey: string, // aka imported service identifier
    importValue: ProcessedImportValue,
  ): boolean {
    return schemas.some(
      (schema) => schema.isReferredToBy(importKey) && schema.isExportingImportValue(importValue),
    );
  }

  public getServicesWithoutUniqueIdentifiers(schemas: ServiceSchema[]): ServiceSchema[] {
    return schemas.filter((schema) => schema.identifiers.some(
      (id) => this.duplicatedIdentifiers.includes(id),
    ));
  }

  public getServiceImportsUsingNonExistentIdentifiers(
  ): ({ schema: ServiceSchema; nonExistentIdentifiersUsed: string[] })[] {
    return this.schemas.map((inspectedSchema) => ({
      schema: inspectedSchema,
      nonExistentIdentifiersUsed: inspectedSchema.importedServices.filter(
        (id) => !this.usedIdentifiers.includes(id),
      ),
    }));
  }

  public getServiceImportsUsingNonDefaultIdentifier(
  ): ({ schema: ServiceSchema; nonDefaultIdentifiersUsed: string[] })[] {
    return this.schemas.map((inspectedSchema) => ({
      schema: inspectedSchema,
      nonDefaultIdentifiersUsed: inspectedSchema.importedServices.filter(
        (id) => !this.usedDefaultIdentifiers.includes(id),
      ),
    }));
  }

  public getServiceImportsNotExportedByTheOtherServices(
  ): ({ schema: ServiceSchema; notExportedImportsMap: ProcessedImportMap })[] {
    return this.schemas.map((inspectedSchema) => {
      // maps each importMap such that the values are the ones not exported by another service
      const notExportedImportsMap = mapObject(inspectedSchema.importMap, (
        importValues: ProcessedImportValue[],
        importedServiceIdentifier: string,
      ) => importValues.filter(
        (importValue) => ServiceSchemaCollection.isServiceImportExportedByAnotherService(
          this.schemas, importedServiceIdentifier, importValue,
        ),
      ));

      return {
        schema: inspectedSchema,
        notExportedImportsMap,
      };
    });
  }

  public getCyclicImportChains(): (ServiceSchema[])[] {
    const g = new graphlib.Graph({ directed: true });

    const nodeMap = fromEntries(this.schemas.map((schema) => [schema.identifier, schema]));

    g.setNodes(Object.keys(nodeMap));

    this.schemas.forEach((schema) => {
      schema.importedServices.forEach((importedServiceIdentifier) => {
        g.setEdge(schema.identifier, importedServiceIdentifier);
      });
    });

    return graphlib.alg.findCycles(g).map((cycle) => cycle.map(
      (serviceIdentifier) => nodeMap[serviceIdentifier],
    ));
  }

  private static computeIdentifiers(schemas: ServiceSchema[]): string[] {
    return schemas.reduce<string[]>(
      (prev, schema) => prev.concat(schema.identifiers), [],
    );
  }

  private static computeDefaultIdentifiers(schemas: ServiceSchema[]): string[] {
    return schemas.map((schema) => schema.identifier);
  }

  private static computeDuplicatedIdentifiers(identifiers: string[]): string[] {
    return identifiers.filter(
      (id, index) => identifiers.indexOf(id) === index
        && identifiers.lastIndexOf(id) !== index,
    );
  }
}
