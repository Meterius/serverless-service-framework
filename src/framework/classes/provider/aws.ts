import * as Aws from "aws-sdk";
import { ProviderImplementation } from "./provider";
import { ServiceContext } from "../service-context";
import { ExportValue, ProcessedImportValue } from "../types/common-schema.types";
import {
  ServerlessTemplatePostExports,
  ServerlessTemplatePreExports,
} from "../../templates.types";
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

    let response: Aws.CloudFormation.DescribeStacksOutput;
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
      + ` from service "${importedService.schema.name}" that is not deployed`,
      );
    }

    return stack;
  }

  async retrieveTemplateProviderBasedImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importValue: ProcessedImportValue<"provider-based">,
    importData: undefined,
  ): Promise<unknown> {
    return {
      "Fn::ImportValue": `${importedService.stackName}-${importValue.name}`,
    };
  }

  async retrieveTemplateDirectImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importValue: ProcessedImportValue<"direct">,
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

    const resources = isObject(template.resources) ? template.resources : {};
    template.resources = resources;

    resources.Outputs = {
      ...(isObject(resources.Outputs) ? resources.Outputs : {}),
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
