import { awsBaseCollection, AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFrameworkDefinition } from "../abstract-framework-definition";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";

export class AwsFrameworkDefinition extends AbstractFrameworkDefinition<AwsProviderDefinition> {
  constructor(
    dirPath: string,
    props: AwsFrameworkSchemaProperties,
  ) {
    super(awsBaseCollection(), dirPath, props);
  }
}
