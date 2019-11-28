import {APD, ServiceHookMap, ServiceSchemaProperties} from "./abstract-provider-definition";

export abstract class AbstractServiceDefinition<
  D extends APD, // AbstractProviderDefinition
> {
  public props: ServiceSchemaProperties<D>;

  public dirPath: string;

  public hookMap: ServiceHookMap<D>;

  constructor(props: ServiceSchemaProperties<D>, dirPath: string, hookMap?: ServiceHookMap<D>) {
    this.props = props;
    this.dirPath = dirPath;
    this.hookMap = hookMap || {};
  }
}
