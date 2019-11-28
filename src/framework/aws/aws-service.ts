import aws from "aws-sdk";
import { AbstractService } from "../abstract-service";
import { AwsProviderDefinition } from "./aws-provider-definition";
import { AwsServiceSchemaProperties } from "./aws-service-schema-properties";
import { AwsFramework } from "./aws-framework";
import { AwsServiceSchema } from "./aws-service-schema";
import { AwsServiceHookMap } from "./aws-service-hook-map";

export class AwsService extends AbstractService<
AwsProviderDefinition
> {
  constructor(
    framework: AwsFramework,
    props: AwsServiceSchemaProperties,
    dirPath: string,
    hookMap: AwsServiceHookMap,
  ) {
    super(
      AwsServiceSchema, framework, props, dirPath, hookMap,
    );
  }

  get awsClientConfig(): { credentials: aws.Credentials; region: string } {
    return {
      credentials: this.framework.provider.credentials,
      region: this.region,
    };
  }
}