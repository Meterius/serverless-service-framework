import { AbstractServiceHook, AbstractServiceHookMap } from "../abstract-service-hook";
import { AwsProviderDefinition } from "./aws-provider-definition";

export type AwsServiceHook = AbstractServiceHook<AwsProviderDefinition>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AwsServiceHookMap extends AbstractServiceHookMap<AwsProviderDefinition> {
}
