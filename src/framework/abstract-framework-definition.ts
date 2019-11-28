import {
  APD,
  FrameworkSchemaProperties, ServiceDefinition,
} from "./abstract-provider-definition";

export abstract class AbstractFrameworkDefinition<
  D extends APD, // AbstractProviderDefinition
> {
  public props: FrameworkSchemaProperties<D>;

  public serviceDefinitions: ServiceDefinition<D>[];

  constructor(
    props: FrameworkSchemaProperties<D>,
    serviceDefinitions: ServiceDefinition<D>[],
  ) {
    this.props = props;
    this.serviceDefinitions = serviceDefinitions;
  }
}
