import { AwsProviderDefinition } from "./aws";
import * as APD from "./abstract-provider-definition";

export type ProviderDefinition = AwsProviderDefinition;

type PD = ProviderDefinition;

export type Provider = APD.Provider<PD>;

export type Stack = APD.Stack<PD>;

export type CommonSchemaProperties = APD.CommonSchemaProperties<PD>;

export type CommonSchema = APD.CommonSchema<PD>;

export type ServiceSchemaProperties = APD.ServiceSchemaProperties<PD>;

export type ServiceSchema = APD.ServiceSchema<PD>;

export type ServiceSchemaCollection = APD.ServiceSchemaCollection<PD>;

export type Service = APD.Service<PD>;

export type ServiceDefinition = APD.ServiceDefinition<PD>;

export type ServiceHook = APD.ServiceHook<PD>;

export type ServiceHookMap = APD.ServiceHookMap<PD>;

export type FrameworkSchemaProperties = APD.FrameworkSchemaProperties<PD>;

export type FrameworkSchema = APD.FrameworkSchema<PD>;

export type Framework = APD.Framework<PD>;

export type FrameworkDefinition = APD.FrameworkDefinition<PD>;

export type FrameworkActionLogic = APD.FrameworkActionLogic<PD>;
