import { APD, Service, ServiceHookContext } from "./abstract-provider-definition";

export type ServiceHook<
  D extends APD
> = (context: ServiceHookContext<D>) => Promise<void>;

type BaseServiceHookMap<D extends APD> = { [hookName: string]: ServiceHook<D> | undefined };

export interface AbstractServiceHookMap<
  D extends APD // AbstractProviderDefinition
  > extends BaseServiceHookMap<D> {
  setup?: ServiceHook<D>;
  preRemove?: ServiceHook<D>;
  postRemove?: ServiceHook<D>;
  preDeploy?: ServiceHook<D>;
  postDeploy?: ServiceHook<D>;
}

export interface AbstractServiceHookContext<D extends APD> {
  service: Service<D>;
  log: (data: string, raw?: boolean) => void;
  async: boolean;
}
