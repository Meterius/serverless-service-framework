import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFramework } from "../abstract-framework";
import { FrameworkOptions } from "../framework-options";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";
import { awsBaseParameter } from "./aws-base-parameter";
import { AwsServiceDefinition } from "./aws-service-definition";

export class AwsFramework extends AbstractFramework<AwsProviderDefinition> {
  constructor(
    dirPath: string,
    props: AwsFrameworkSchemaProperties,
    options: FrameworkOptions,
    serviceDefinitions: AwsServiceDefinition[],
    stage: string,
    profile?: string,
  ) {
    super(
      awsBaseParameter, dirPath, props, options, serviceDefinitions, stage, profile,
    );
  }
}
