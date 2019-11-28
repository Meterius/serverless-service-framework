import { APD, ServiceHook } from "./abstract-provider-definition";

export interface AbstractServiceHookMap<
  D extends APD // AbstractProviderDefinition
> {
  setup?: ServiceHook<D>;
  postDeploy?: ServiceHook<D>;
}
