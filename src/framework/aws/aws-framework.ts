import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFramework } from "../abstract-framework";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";
import { FrameworkOptions } from "../framework-options";
import { AwsFrameworkActionLogic } from "./aws-framework-action-logic";
import { AwsFrameworkSchema } from "./aws-framework-schema";
import { AwsServiceSchemaCollection } from "./aws-service-schema-collection";
import { AwsService } from "./aws-service";
import { AwsProvider } from "./aws-provider";

export class AwsFramework extends AbstractFramework<AwsProviderDefinition> {
  constructor(
    props: AwsFrameworkSchemaProperties,
    options: FrameworkOptions,
    stage: string,
  ) {
    super(
      AwsProvider,
      AwsFrameworkActionLogic,
      AwsFrameworkSchema,
      AwsService,
      AwsServiceSchemaCollection,
      props, options, stage,
    );
  }
}
