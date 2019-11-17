import * as Aws from "aws-sdk";
import { ProviderImplementation } from "./provider";
import { ServiceContext } from "../service-context";
import { ExportValue, ImportType, ProcessedImportValue } from "../common-schema";
import {
  ServerlessTemplatePostExports,
  ServerlessTemplatePreExports,
} from "../../templates";
import { isObject } from "../../../common/type-guards";

/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */

const deletedStackStates = ["DELETE_IN_PROGRESS", "DELETE_COMPLETE"];

type TemplateExportValue = { Value: string };

type Stack = Aws.CloudFormation.Stack;

export class AwsProvider extends ProviderImplementation<
TemplateExportValue, Stack, undefined, Stack> {
  public readonly name = "aws";

  async retrieveServiceStack(service: ServiceContext): Promise<Stack | undefined> {
    const cf = AwsProvider.getCloudFormation(service);

    const response: Aws.CloudFormation.DescribeStacksOutput = await cf.describeStacks({
      StackName: service.stackName,
    }).promise();

    return (response.Stacks || []).find(
      (stack) => !deletedStackStates.includes(stack.StackStatus),
    );
  }

  async prepareTemplateProviderBasedImports(
    service: ServiceContext,
    importedService: ServiceContext,
  ): Promise<undefined> {
    return undefined;
  }

  async prepareTemplateDirectImports(
    service: ServiceContext,
    importedService: ServiceContext,
  ): Promise<Stack> {
    const stack = await this.retrieveServiceStack(importedService);

    if (stack === undefined) {
      throw new Error(
        `Service "${service.schema.name}" imports via direct import`
      + `from "${importedService.schema.name}" that is not deployed`,
      );
    }

    return stack;
  }

  async retrieveTemplateProviderBasedImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importValue: Omit<ProcessedImportValue, "type"> & { type: ImportType.ProviderBased },
    importData: undefined,
  ): Promise<unknown> {
    return {
      "Fn::ImportValue": `${importedService.stackName}-${importValue.name}`,
    };
  }

  async retrieveTemplateDirectImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importValue: Omit<ProcessedImportValue, "type"> & { type: ImportType.Direct },
    importData: Stack,
  ): Promise<unknown> {
    const output = (importData.Outputs || []).find(
      (item) => item.OutputKey === importValue.name,
    );

    if (output === undefined) {
      throw new Error(
        `Service "${service.schema.name}" imports via direct import "${importValue.name}" `
        + `from "${importedService.schema.name}" that is not exported by the stack`,
      );
    }

    return output.OutputValue;
  }

  retrieveTemplateExportValue(
    service: ServiceContext,
    exportName: string,
    exportValue: ExportValue,
  ): TemplateExportValue {
    return {
      Value: exportValue,
    };
  }

  insertTemplateExportValues(
    service: ServiceContext,
    exportValueMap: Record<string, TemplateExportValue>,
    template: ServerlessTemplatePreExports,
  ): ServerlessTemplatePostExports {
    /* eslint-disable no-param-reassign */

    const resources = isObject(template.resources.Resources) ? template.resources.Resources : {};
    template.resources.Resources = resources;

    const outputs = isObject(resources.Outputs) ? resources.Outputs : {};
    resources.Outputs = {
      ...outputs,
      ...exportValueMap,
    };

    return template;
  }

  private static getCloudFormation(service: ServiceContext): Aws.CloudFormation {
    return new Aws.CloudFormation({
      region: service.region,
    });
  }
}
