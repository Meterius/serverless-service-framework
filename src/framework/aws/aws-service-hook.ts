import { AbstractServiceHookContext, AbstractServiceHookMap } from "../abstract-service-hook";
import { AwsProviderDefinition } from "./aws-provider-definition";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AwsServiceHookContext extends AbstractServiceHookContext<AwsProviderDefinition> {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AwsServiceHookMap extends AbstractServiceHookMap<AwsProviderDefinition> {
}
