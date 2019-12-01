import { APD, Service, ServiceHook } from "./abstract-provider-definition";

export type AbstractServiceHook<
  D extends APD
> = (service: Service<D>, log: (data: string, raw?: boolean) => void) => Promise<void>;

export interface AbstractServiceHookMap<
  D extends APD // AbstractProviderDefinition
  > {
  setup?: ServiceHook<D>;
  preRemove?: ServiceHook<D>;
  postRemove?: ServiceHook<D>;
  preDeploy?: ServiceHook<D>;
  postDeploy?: ServiceHook<D>;
}
