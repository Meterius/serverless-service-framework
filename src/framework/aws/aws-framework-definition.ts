import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFrameworkDefinition } from "../abstract-framework-definition";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";
import { awsBaseParameter } from "./aws-base-parameter";

export class AwsFrameworkDefinition extends AbstractFrameworkDefinition<AwsProviderDefinition> {
  constructor(
    dirPath: string,
    props: AwsFrameworkSchemaProperties,
  ) {
    super(awsBaseParameter, dirPath, props);
  }
}
