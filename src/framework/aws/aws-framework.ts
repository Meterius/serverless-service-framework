import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFramework } from "../abstract-framework";
import { FrameworkOptions } from "../framework-options";
import { AwsFrameworkSchemaProperties } from "./aws-framework-schema-properties";
import { awsBaseParameter } from "./aws-base-parameter";
import { AwsServiceDefinition } from "./aws-service-definition";

export class AwsFramework extends AbstractFramework<AwsProviderDefinition> {
  private readonly awsFrameworkConstructorParams: {
    dirPath: string;
    props: AwsFrameworkSchemaProperties;
    options: FrameworkOptions;
    serviceDefinitions: AwsServiceDefinition[];
    stage: string;
    profile?: string;
  };

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

    this.awsFrameworkConstructorParams = {
      dirPath, props, options, serviceDefinitions, stage, profile,
    };
  }

  /**
   * Creates new AwsFramework that uses a different stage.
   * @param stage
   */
  public withChangedStage(stage: string): AwsFramework {
    return new AwsFramework(
      this.awsFrameworkConstructorParams.dirPath,
      this.awsFrameworkConstructorParams.props,
      this.awsFrameworkConstructorParams.options,
      this.awsFrameworkConstructorParams.serviceDefinitions,
      stage,
      this.awsFrameworkConstructorParams.profile,
    );
  }
}
