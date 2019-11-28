import { AbstractProviderDefinition } from "../abstract-provider-definition";
import { AwsStack } from "./aws-stack";
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AwsProviderDefinition extends AbstractProviderDefinition<
AwsProviderDefinition,
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