import { APD, Service } from "./abstract-provider-definition";

export abstract class AbstractProviderStack<
  D extends APD, // AbstractProviderDefinition
  SD, // StackData
> {
  protected readonly data: SD;

  public readonly service: Service<D>;

  public constructor(service: Service<D>, stackData: SD) {
    this.service = service;
    this.data = stackData;
  }

  public abstract get stackExports(): Record<string, string>;

  public getStackExport(
    exportName: string,
  ): string {
    const exportValue = this.stackExports[exportName];

    if (exportValue === undefined) {
      throw new Error(`Export "${exportName}" of Service Stack "${this.service.name}" not found`);
    } else {
      return exportValue;
    }
  }
}
