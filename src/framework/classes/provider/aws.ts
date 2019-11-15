import { Provider } from "../provider";
import { ServiceContext } from "../service-context";
import { ProcessedImportValue } from "../common-schema";

/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */

export class AwsProvider extends Provider<undefined> {
  public readonly name = "aws";

  async retrieveImportData(
    service: ServiceContext,
    importedService: ServiceContext,
  ): Promise<undefined> {
    return undefined;
  }

  async retrieveTemplateImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importData: undefined,
    importValue: ProcessedImportValue,
  ): Promise<unknown> {
    return undefined;
  }
}
