import { Provider } from "../provider";
import { ServiceContext } from "../service-context";
import { ImportType, ProcessedImportValue } from "../common-schema";

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
    switch (importValue.type) {
      default:
        throw new Error(
          `For provider "${this.name}" imports of type "${importValue.type}" are not implemented`,
        );

      case ImportType.ProviderBased:
        return {
          "Fn::ImportValue": `${importedService.stackName}-${importValue.name}`,
        };
    }
  }
}
