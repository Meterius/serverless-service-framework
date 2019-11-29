import { BaseCollection } from "../abstract-provider-definition";
import { AwsProviderDefinition } from "./aws-provider-definition";
import { AwsProvider } from "./aws-provider";
import { AwsStack } from "./aws-stack";
import { AwsCommonSchema } from "./aws-common-schema";
import { AwsServiceSchema } from "./aws-service-schema";
import { AwsServiceSchemaCollection } from "./aws-service-schema-collection";
import { AwsService } from "./aws-service";
import { AwsServiceDefinition } from "./aws-service-definition";
import { AwsFrameworkSchema } from "./aws-framework-schema";
import { AwsFramework } from "./aws-framework";
import { AwsFrameworkDefinition } from "./aws-framework-definition";
import { AwsFrameworkActionLogic } from "./aws-framework-action-logic";

export const awsBaseParameter: () => BaseCollection<AwsProviderDefinition> = () => ({
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
