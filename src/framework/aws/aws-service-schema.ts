import { AbstractServiceSchema } from "../abstract-service-schema";
import { AwsProviderDefinition } from "./aws-provider-definition";
import { AwsFrameworkSchema } from "./aws-framework-schema";
import { AwsServiceSchemaProperties } from "./aws-service-schema-properties";
import { awsBaseParameter } from "./aws-base-parameter";

export class AwsServiceSchema extends AbstractServiceSchema<
AwsProviderDefinition
> {
  constructor(
    frameworkSchema: AwsFrameworkSchema,
    props: AwsServiceSchemaProperties,
  ) {
    super(awsBaseParameter, frameworkSchema, props);
  }
}
