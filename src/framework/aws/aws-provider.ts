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

type DirectImportValue = string;

function customBackoff(retryCount: number, err: any): number {
  if (!err.retryable) {
    return -1;
  }

  if (err.code === "Throttling") {
    if (retryCount > 1000) {
      return -1;
    }

    return 1000 + Math.random() * Math.min((2 ** retryCount) * 500, 10000);
  } else {
    if (retryCount > 5) {
      return -1;
    }

    return (2 ** retryCount) * 100;
  }
}

export class AwsProvider extends AbstractProvider<
AwsProviderDefinition,
{ "direct-import": AwsStack },
TemplateExportValue,
DirectImportValue
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

  // eslint-disable-next-line no-dupe-class-members
  prepareTemplateDirectImports(
    service: AwsService,
    importedService: AwsService,
    throwIfNotDeployed?: true,
  ): Promise<AwsStack>;

  // eslint-disable-next-line no-dupe-class-members
  prepareTemplateDirectImports(
    service: AwsService,
    importedService: AwsService,
    throwIfNotDeployed: false,
  ): Promise<AwsStack | undefined>;

  // eslint-disable-next-line no-dupe-class-members
  async prepareTemplateDirectImports(
    service: AwsService,
    importedService: AwsService,
    throwIfNotDeployed = true,
  ): Promise<AwsStack | undefined> {
    const stack = await this.retrieveServiceStack(importedService);

    if (stack === undefined) {
      if (throwIfNotDeployed) {
        throw new Error(
          `Service "${service.schema.name}" imports via direct import`
          + ` from service "${importedService.schema.name}" that is not deployed`,
        );
      } else {
        return undefined;
      }
    }

    return stack;
  }

  // eslint-disable-next-line class-methods-use-this
  retrieveTemplateProviderBasedImportValue(
    service: AwsService,
    importedService: AwsService,
    importValue: ProcessedImportValue<"provider-based">,
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
  ): DirectImportValue {
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
      maxRetries: Infinity,
      retryDelayOptions: {
        customBackoff,
      },
    });
  }
}
