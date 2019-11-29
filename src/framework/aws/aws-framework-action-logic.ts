import { awsBaseCollection, AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractFrameworkActionLogic } from "../abstract-framework-action-logic";
import { AwsFramework } from "./aws-framework";

export class AwsFrameworkActionLogic extends AbstractFrameworkActionLogic<AwsProviderDefinition> {
  constructor(framework: AwsFramework) {
    super(awsBaseCollection(), framework);
  }
}
