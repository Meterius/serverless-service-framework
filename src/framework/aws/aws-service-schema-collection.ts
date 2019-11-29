import { awsBaseCollection, AwsProviderDefinition } from "./aws-provider-definition";
import { AbstractServiceSchemaCollection } from "../abstract-service-collection";
import { AwsServiceSchema } from "./aws-service-schema";

export class AwsServiceSchemaCollection extends AbstractServiceSchemaCollection<AwsProviderDefinition> {
  constructor(serviceSchemas: AwsServiceSchema[]) {
    super(awsBaseCollection(), serviceSchemas);
  }
}
