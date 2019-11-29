import { awsBaseCollection, AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractCommonSchema } from "../abstract-common-schema";
import { AwsCommonSchemaProperties } from "./aws-common-schema-properties";

export class AwsCommonSchema extends AbstractCommonSchema<AwsProviderDefinition> {
  constructor(
    baseProps: AwsCommonSchemaProperties,
    specificProps?: AwsCommonSchemaProperties,
  ) {
    super(awsBaseCollection(), baseProps, specificProps);
  }
}
