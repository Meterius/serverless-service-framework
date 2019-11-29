import * as Aws from "aws-sdk";
import { AbstractStack } from "../abstract-stack";
import { awsBaseParameter } from "./aws-base-parameter";
import { AwsService } from "./aws-service";

export type AwsStackData = Aws.CloudFormation.Stack;

export class AwsStack extends AbstractStack<any, AwsStackData> {
  constructor(service: AwsService, data: AwsStackData) {
    super(awsBaseParameter, service, data);
  }

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
