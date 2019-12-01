import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractCommonSchema } from "../abstract-common-schema";
import { AwsCommonSchemaProperties } from "./aws-common-schema-properties";
import { awsBaseParameter } from "./aws-base-parameter";

export class AwsCommonSchema extends AbstractCommonSchema<AwsProviderDefinition> {
  constructor(
    baseProps: AwsCommonSchemaProperties,
    specificProps?: AwsCommonSchemaProperties,
  ) {
    super(awsBaseParameter, baseProps, specificProps);
  }
}
