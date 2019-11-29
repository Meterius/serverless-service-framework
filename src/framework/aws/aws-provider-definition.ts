import { AbstractProviderDefinition, BaseCollection } from "../abstract-provider-definition";
import { AwsStack, AwsStackData } from "./aws-stack";
import { AwsService } from "./aws-service";
import { AwsProvider } from "./aws-provider";
import { AwsCommonSchemaProperties } from "./aws-common-schema-properties";
import { AwsCommonSchema } from "./aws-common-schema";
import { AwsServiceSchemaProperties } from "./aws-service-schema-properties";
import { AwsServiceSchema } from "./aws-service-schema";
import { AwsServiceSchemaCollection } from "./aws-service-schema-collection";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";
import { AwsFrameworkSchema } from "./aws-framework-schema";
import { AwsFramework } from "./aws-framework";
import { AwsFrameworkActionLogic } from "./aws-framework-action-logic";
import { AwsServiceDefinition } from "./aws-service-definition";
import { AwsFrameworkDefinition } from "./aws-framework-definition";
import { AwsServiceHook } from "./aws-service-hook";
import { AwsServiceHookMap } from "./aws-service-hook-map";
import { AwsClassCollection } from "./aws-class-collection";
import { AwsBaseCollection } from "./aws-base-collection";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AwsProviderDefinition extends AbstractProviderDefinition<
AwsStackData,

AwsProviderDefinition,
AwsClassCollection,
AwsBaseCollection,
AwsProvider,
AwsStack,
AwsCommonSchemaProperties,
AwsCommonSchema,
AwsServiceSchemaProperties,
AwsServiceSchema,
AwsServiceSchemaCollection,
AwsService,
AwsServiceDefinition,
AwsServiceHook,
AwsServiceHookMap,
AwsFrameworkSchemaProperties,
AwsFrameworkSchema,
AwsFramework,
AwsFrameworkDefinition,
AwsFrameworkActionLogic
> {}

export const awsBaseCollection: () => BaseCollection<AwsProviderDefinition> = () => ({
  classes: {
    Provider: AwsProvider,
    Stack: AwsStack,
    CommonSchema: AwsCommonSchema,
    ServiceSchema: AwsServiceSchema,
    ServiceSchemaCollection: AwsServiceSchemaCollection,
    Service: AwsService,
    ServiceDefinition: AwsServiceDefinition,
    FrameworkSchema: AwsFrameworkSchema,
    Framework: AwsFramework,
    FrameworkDefinition: AwsFrameworkDefinition,
    FrameworkActionLogic: AwsFrameworkActionLogic,
  },
});
