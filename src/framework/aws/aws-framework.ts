import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFramework } from "../abstract-framework";
import { FrameworkOptions } from "../framework-options";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";
import { awsBaseParameter } from "./aws-base-parameter";

export class AwsFramework extends AbstractFramework<AwsProviderDefinition> {
  constructor(
    dirPath: string,
    props: AwsFrameworkSchemaProperties,
    options: FrameworkOptions,
    stage: string,
    profile?: string,
  ) {
    super(
      awsBaseParameter, dirPath, props, options, stage, profile,
    );
  }
}
