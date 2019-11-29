import {
  APD, BaseCollection,
  FrameworkSchemaProperties, ServiceDefinition,
} from "./abstract-provider-definition";
import { loadServiceDefinitionFilesFromRoot } from "./service-definition";
import { FrameworkOptions } from "./framework-options";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractFrameworkDefinition<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  public props: FrameworkSchemaProperties<D>;

  public serviceDefinitions: ServiceDefinition<D>[] = [];

  public serviceDefinitionRoots: [string, boolean][] = [];

  public readonly dirPath: string;

  constructor(
    base: BaseCollection<D>,
    dirPath: string,
    props: FrameworkSchemaProperties<D>,
  ) {
    super(base);

    this.dirPath = dirPath;
    this.props = props;
  }

  addServiceDefinitions(
    serviceDefinitions: ServiceDefinition<D>[],
  ): void {
    this.serviceDefinitions.push(...serviceDefinitions);
  }

  addServiceDefinitionRoot(
    serviceRootPath: string,
    expectEachDirToContainServices: boolean,
  ): void {
    this.serviceDefinitionRoots.push([serviceRootPath, expectEachDirToContainServices]);
  }

  async getServiceDefinitions(options: FrameworkOptions): Promise<ServiceDefinition<D>[]> {
    const defs = (await Promise.all(
      this.serviceDefinitionRoots.map((
        [serviceRootPath, expectEachDirToContainServices],
      ) => loadServiceDefinitionFilesFromRoot(
        serviceRootPath, expectEachDirToContainServices, options,
      )),
    )).reduce((prev, curr) => prev.concat(curr), []);

    return defs.concat(this.serviceDefinitions);
  }
}
