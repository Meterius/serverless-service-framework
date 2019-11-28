import { AbstractServiceSchema } from "../abstract-service-schema";
import { AwsProviderDefinition } from "./aws-provider-definition";
import { AwsFrameworkSchema } from "./aws-framework-schema";
import { AwsCommonSchema } from "./aws-common-schema";
import { AwsServiceSchemaProperties } from "./aws-service-schema-properties";

export class AwsServiceSchema extends AbstractServiceSchema<
AwsProviderDefinition
> {
  constructor(
    frameworkSchema: AwsFrameworkSchema,
    props: AwsServiceSchemaProperties,
  ) {
    super(AwsCommonSchema, frameworkSchema, props);
  }
}
