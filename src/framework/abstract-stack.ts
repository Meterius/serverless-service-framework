import { APD, BaseParameter, Service } from "./abstract-provider-definition";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractStack<
  D extends APD, // AbstractProviderDefinition
  SD, // StackData
> extends AbstractBase<D> {
  protected readonly data: SD;

  public readonly service: Service<D>;

  constructor(
    base: BaseParameter<D>,
    service: Service<D>,
    stackData: SD,
  ) {
    super(base);

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
