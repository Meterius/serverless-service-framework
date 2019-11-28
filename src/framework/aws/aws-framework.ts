import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFramework } from "../abstract-framework";
import { FrameworkOptions } from "../framework-options";
import { AwsFrameworkActionLogic } from "./aws-framework-action-logic";
import { AwsFrameworkSchema } from "./aws-framework-schema";
import { AwsServiceSchemaCollection } from "./aws-service-schema-collection";
import { AwsService } from "./aws-service";
import { AwsProvider } from "./aws-provider";
import { AwsFrameworkDefinition } from "./aws-framework-definition";

export class AwsFramework extends AbstractFramework<AwsProviderDefinition> {
  constructor(
    definition: AwsFrameworkDefinition,
    options: FrameworkOptions,
    stage: string,
    profile?: string,
  ) {
    super(
      AwsProvider,
      AwsFrameworkActionLogic,
      AwsFrameworkSchema,
      AwsService,
      AwsServiceSchemaCollection,
      definition, options, stage, profile,
    );
  }
}
