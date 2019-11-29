import { AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractServiceSchemaCollection } from "../abstract-service-schema-collection";
import { AwsServiceSchema } from "./aws-service-schema";
import { awsBaseParameter } from "./aws-base-parameter";

export class AwsServiceSchemaCollection extends AbstractServiceSchemaCollection<AwsProviderDefinition> {
  constructor(serviceSchemas: AwsServiceSchema[]) {
    super(awsBaseParameter, serviceSchemas);
  }
}
