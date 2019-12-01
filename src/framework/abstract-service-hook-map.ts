import { APD, ServiceHook } from "./abstract-provider-definition";

export interface AbstractServiceHookMap<
  D extends APD // AbstractProviderDefinition
> {
  setup?: ServiceHook<D>;
  preRemove?: ServiceHook<D>;
  postRemove?: ServiceHook<D>;
  preDeploy?: ServiceHook<D>;
  postDeploy?: ServiceHook<D>;
}
