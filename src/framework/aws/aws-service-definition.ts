import { AbstractServiceDefinition } from "../abstract-service-definition";
import { awsBaseCollection, AwsProviderDefinition } from "./aws-provider-definition";
import { AwsServiceSchemaProperties } from "./aws-service-schema-properties";

export class AwsServiceDefinition extends AbstractServiceDefinition<AwsProviderDefinition> {
  constructor(
    dirPath: string,
    props: AwsServiceSchemaProperties,
  ) {
    super(awsBaseCollection(), dirPath, props);
  }
}
