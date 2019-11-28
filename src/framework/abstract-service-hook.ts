import { APD, Service } from "./abstract-provider-definition";

export type AbstractServiceHook<
  D extends APD // AbstractProviderDefinition
> = (service: Service<D>, log: (data: string, raw?: boolean) => void) => Promise<void>;
