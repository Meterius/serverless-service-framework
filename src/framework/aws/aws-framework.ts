import { awsBaseCollection, AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFramework } from "../abstract-framework";
import { FrameworkOptions } from "../framework-options";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";

export class AwsFramework extends AbstractFramework<AwsProviderDefinition> {
  constructor(
    dirPath: string,
    props: AwsFrameworkSchemaProperties,
    options: FrameworkOptions,
    stage: string,
    profile?: string,
  ) {
    super(
      awsBaseCollection(), dirPath, props, options, stage, profile,
    );
  }
}
