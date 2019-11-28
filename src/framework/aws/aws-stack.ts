import * as Aws from "aws-sdk";
import { AbstractProviderStack } from "../abstract-provider-stack";

export type StackData = Aws.CloudFormation.Stack;

export class AwsStack extends AbstractProviderStack<any, StackData> {
  get stackExports(): Record<string, string> {
    const exportMap: Record<string, string> = {};

    (this.data.Outputs || []).forEach((output) => {
      if (output.OutputKey !== undefined && output.OutputValue !== undefined) {
        exportMap[output.OutputKey] = output.OutputValue;
      }
    });

    return exportMap;
  }
}
