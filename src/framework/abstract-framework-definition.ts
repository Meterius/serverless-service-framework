import {
  APD, BaseParameter,
  FrameworkSchemaProperties, ServiceDefinition,
} from "./abstract-provider-definition";
import { loadServiceDefinitionFilesFromRoot } from "./service-definition";
import { FrameworkOptions } from "./framework-options";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractFrameworkDefinition<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  props: FrameworkSchemaProperties<D>;

  serviceDefinitions: ServiceDefinition<D>[] = [];

  serviceDefinitionRoots: [string, boolean][] = [];

  readonly dirPath: string;

  constructor(
    base: BaseParameter<D>,
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
