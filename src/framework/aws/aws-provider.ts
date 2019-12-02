import aws from "aws-sdk";
import deasync from "deasync";
import { AbstractProvider } from "../abstract-provider";
import { AwsProviderDefinition } from "./aws-provider-definition";
import { AwsStack } from "./aws-stack";
import { AwsService } from "./aws-service";
import { ProcessedImportValue } from "../abstract-service-schema-properties";
import { ExportValue } from "../abstract-common-schema-properties";
import { ServerlessTemplatePostExports, ServerlessTemplatePreExports } from "../templates";
import { isObject } from "../../common/type-guards";
import { AwsFramework } from "./aws-framework";
import { awsBaseParameter } from "./aws-base-parameter";

const deletedStackStates = ["DELETE_IN_PROGRESS", "DELETE_COMPLETE"];

type TemplateExportValue = { Value: unknown };

export class AwsProvider extends AbstractProvider<
AwsProviderDefinition,
{ "provider-based": undefined; "direct-import": AwsStack },
TemplateExportValue
> {
  readonly name = "aws";

  readonly credentials: aws.SharedIniFileCredentials;

  constructor(framework: AwsFramework) {
    super(awsBaseParameter, framework);

    const chain = new aws.CredentialProviderChain([
      (): aws.Credentials => new aws.EnvironmentCredentials("AWS"),
      (): aws.Credentials => new aws.EnvironmentCredentials("AMAZON"),
      (): aws.Credentials => new aws.SharedIniFileCredentials({ profile: framework.profile }),
      (): aws.Credentials => new aws.ECSCredentials(),
      (): aws.Credentials => new aws.EC2MetadataCredentials(),
      (): aws.Credentials => new aws.ProcessCredentials(),
    ]);

    this.credentials = deasync((cb: (err: any, creds: any) => void) => chain.resolve(cb))();
  }

  // eslint-disable-next-line class-methods-use-this
  async retrieveServiceStack(
    service: AwsService,
  ): Promise<AwsStack | undefined> {
    const cf = AwsProvider.getCloudFormation(service);

    let response: aws.CloudFormation.DescribeStacksOutput;
    try {
      response = await cf.describeStacks({
        StackName: service.stackName,
      }).promise();
    } catch (err) {
      if (err.code === "ValidationError"
        && err.message === `Stack with id ${service.stackName} does not exist`) {
        return undefined;
      } else {
        throw err;
      }
    }

    const stackData = (response.Stacks || []).find(
      (foundStack) => !deletedStackStates.includes(foundStack.StackStatus),
    );

    if (stackData === undefined) {
      return undefined;
    }

    return new AwsStack(service, stackData);
  }

  // eslint-disable-next-line class-methods-use-this
  async prepareTemplateProviderBasedImports(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    service: AwsService,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    importedService: AwsService,
  ): Promise<undefined> {
    return undefined;
  }

  async prepareTemplateDirectImports(
    service: AwsService,
    importedService: AwsService,
  ): Promise<AwsStack> {
    const stack = await this.retrieveServiceStack(importedService);

    if (stack === undefined) {
      throw new Error(
        `Service "${service.schema.name}" imports via direct import`
      + ` from service "${importedService.schema.name}" that is not deployed`,
      );
    }

    return stack;
  }

  // eslint-disable-next-line class-methods-use-this
  retrieveTemplateProviderBasedImportValue(
    service: AwsService,
    importedService: AwsService,
    importValue: ProcessedImportValue<"provider-based">,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    importData: undefined,
  ): unknown {
    return {
      "Fn::ImportValue": `${importedService.stackName}-${importValue.name}`,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  retrieveTemplateDirectImportValue(
    service: AwsService,
    importedService: AwsService,
    importValue: ProcessedImportValue<"direct">,
    importData: AwsStack,
  ): unknown {
    const output: string | undefined = importData.stackExports[importValue.name];

    if (output === undefined) {
      throw new Error(
        `Service "${service.schema.name}" imports via direct import "${importValue.name}" `
        + `from "${importedService.schema.name}" that is not exported by the stack`,
      );
    }

    return output;
  }

  // eslint-disable-next-line class-methods-use-this
  retrieveTemplateExportValue(
    service: AwsService,
    exportName: string,
    exportValue: ExportValue,
  ): TemplateExportValue {
    return {
      Value: exportValue,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  insertTemplateExportValues(
    service: AwsService,
    exportValueMap: Record<string, TemplateExportValue>,
    template: ServerlessTemplatePreExports,
  ): ServerlessTemplatePostExports {
    /* eslint-disable no-param-reassign */

    const resources = isObject(template.resources) ? template.resources : {};
    template.resources = resources;

    resources.Outputs = {
      ...(isObject(resources.Outputs) ? resources.Outputs : {}),
      ...exportValueMap,
    };

    return template;
  }

  private static getCloudFormation(service: AwsService): aws.CloudFormation {
    return new aws.CloudFormation({
      ...service.awsClientConfig,
    });
  }
}
