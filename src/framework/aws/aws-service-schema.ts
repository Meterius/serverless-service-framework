import { AbstractServiceSchema } from "../abstract-service-schema";
import { awsBaseCollection, AwsProviderDefinition } from "./aws-provider-definition";
import { AwsFrameworkSchema } from "./aws-framework-schema";
import { AwsServiceSchemaProperties } from "./aws-service-schema-properties";

export class AwsServiceSchema extends AbstractServiceSchema<
AwsProviderDefinition
> {
  constructor(
    frameworkSchema: AwsFrameworkSchema,
    props: AwsServiceSchemaProperties,
  ) {
    super(awsBaseCollection(), frameworkSchema, props);
  }
}
