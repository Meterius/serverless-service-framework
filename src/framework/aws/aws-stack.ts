import aws from "aws-sdk";
import { AbstractStack } from "../abstract-stack";
import { awsBaseParameter } from "./aws-base-parameter";
import { AwsService } from "./aws-service";
import { AwsProviderDefinition } from "./aws-provider-definition";

export type AwsStackData = aws.CloudFormation.Stack;

export class AwsStack extends AbstractStack<AwsProviderDefinition, AwsStackData> {
  constructor(service: AwsService, data: AwsStackData) {
    super(awsBaseParameter, service, data);
  }

  private get s3(): aws.S3 {
    return new aws.S3(this.service.awsClientConfig);
  }

  private get cf(): aws.CloudFormation {
    return new aws.CloudFormation(this.service.awsClientConfig);
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

  private async getResources(): Promise<aws.CloudFormation.StackResources> {
    const { cf } = this;

    const response = await cf.describeStackResources({
      StackName: this.data.StackName,
    }).promise();

    return response.StackResources || [];
  }

  private async getBuckets(): Promise<string[]> {
    return (await this.getResources()).filter(
      (resource) => resource.ResourceType === "AWS::S3::Bucket" && resource.PhysicalResourceId !== undefined,
    ).map(
      (resource) => resource.PhysicalResourceId || "",
    );
  }

  private async emptyBucket(bucket: string): Promise<void> {
    const { s3 } = this;

    let foundItems = true;
    do {
      const response = ((await s3.listObjectVersions({
        Bucket: bucket,
      }).promise()));

      const items: ({ Key?: string; VersionId?: string })[] = (
        response.DeleteMarkers || []
      ).filter(({ Key }) => Key !== undefined);

      items.push(...(response.Versions || []));

      if (items.length > 0) {
        await s3.deleteObjects({
          Bucket: bucket,
          Delete: {
            Objects: items.filter((item) => item.Key !== undefined).map((item) => ({
              Key: item.Key || "",
              VersionId: item.VersionId,
            })),
          },
        }).promise();
      } else {
        foundItems = false;
      }
    } while (foundItems);
  }

  async emptyAllBuckets(): Promise<string[]> {
    const buckets = await this.getBuckets();

    await Promise.all(
      buckets.map((bucket) => this.emptyBucket(bucket)),
    );

    return buckets;
  }
}
