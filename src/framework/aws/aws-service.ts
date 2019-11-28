import { AbstractService } from "../abstract-service";
import { AwsProviderDefinition } from "./aws-provider-definition";
import { AwsServiceSchemaProperties } from "./aws-service-schema-properties";
import { AwsFramework } from "./aws-framework";
import { AwsServiceSchema } from "./aws-service-schema";

export class AwsService extends AbstractService<
AwsProviderDefinition
> {
  constructor(
    framework: AwsFramework,
    props: AwsServiceSchemaProperties,
    dirPath: string,
  ) {
    super(
      AwsServiceSchema, framework, props, dirPath,
    );
  }
}
