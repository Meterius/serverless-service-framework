import {
  APD, ServiceHookMap, ServiceHook, ServiceSchemaProperties, BaseParameter,
} from "./abstract-provider-definition";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractServiceDefinition<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  public dirPath: string;

  public props: ServiceSchemaProperties<D>;

  public hookMap: ServiceHookMap<D> = {};

  constructor(
    base: BaseParameter<D>,
    dirPath: string,
    props: ServiceSchemaProperties<D>,
  ) {
    super(base);

    this.dirPath = dirPath;
    this.props = props;
  }

  addHooks(hookMap?: ServiceHookMap<D>): void {
    const currHooks = this.hookMap as Record<string, ServiceHook<D>>;
    const nextHooks = hookMap as Record<string, ServiceHook<D>>;

    // if old hook was undefined, it is overwritten by the new hook
    // if old hook was specified,
    //  it is overwritten by a combined hook that executes first the old and then the new
    Object.entries(nextHooks).forEach(([name, func]) => {
      if (currHooks[name] !== undefined) {
        currHooks[name] = async function combinedHook(
          service: ServiceHook<D>, log: (data: string, raw?: boolean) => void,
        ): Promise<void> {
          await currHooks[name](service, log);
          await nextHooks[name](service, log);
        };
      } else {
        currHooks[name] = func;
      }
    });
  }
}
