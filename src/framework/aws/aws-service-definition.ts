import { AbstractServiceDefinition } from "../abstract-service-definition";
import { AwsProviderDefinition } from "./aws-provider-definition";
import { AwsServiceSchemaProperties } from "./aws-service-schema-properties";
import { awsBaseParameter } from "./aws-base-parameter";

export class AwsServiceDefinition extends AbstractServiceDefinition<AwsProviderDefinition> {
  constructor(
    dirPath: string,
    props: AwsServiceSchemaProperties,
  ) {
    super(awsBaseParameter, dirPath, props);
  }
}
