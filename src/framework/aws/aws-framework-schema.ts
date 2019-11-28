import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFrameworkSchema } from "../abstract-framework-schema";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";
import { AwsCommonSchema } from "./aws-common-schema";
import { FrameworkOptions } from "../framework-options";

export class AwsFrameworkSchema extends AbstractFrameworkSchema<
AwsProviderDefinition
> {
  constructor(props: AwsFrameworkSchemaProperties, options: FrameworkOptions) {
    super(AwsCommonSchema, props, options);
  }
}
