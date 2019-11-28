import { APD, ServiceSchemaProperties } from "./abstract-provider-definition";

export abstract class AbstractServiceDefinition<
  D extends APD, // AbstractProviderDefinition
> {
  public props: ServiceSchemaProperties<D>;

  public dirPath: string;

  constructor(props: ServiceSchemaProperties<D>, dirPath: string) {
    this.props = props;
    this.dirPath = dirPath;
  }
}
