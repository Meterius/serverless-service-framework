import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFrameworkActionLogic } from "../abstract-framework-action-logic";
import { AwsFramework } from "./aws-framework";
import { awsBaseParameter } from "./aws-base-parameter";

export class AwsFrameworkActionLogic extends AbstractFrameworkActionLogic<AwsProviderDefinition> {
  constructor(framework: AwsFramework) {
    super(awsBaseParameter, framework);
  }
}
