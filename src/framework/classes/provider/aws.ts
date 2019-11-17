import { Provider } from "../provider";
import { ServiceContext } from "../service-context";
import { ExportValue, ImportType, ProcessedImportValue } from "../common-schema";
import {
  ServerlessTemplatePostExports,
  ServerlessTemplatePreExports,
} from "../../templates";
import { isObject } from "../../../common/type-guards";

/* eslint-disable @typescript-eslint/no-unused-vars, class-methods-use-this */

type TemplateExportValue = { Value: string };

export class AwsProvider extends Provider<TemplateExportValue> {
  public readonly name = "aws";

  async retrieveTemplateImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
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

  async retrieveTemplateExportValue(
    service: ServiceContext,
    exportName: string,
    exportValue: ExportValue,
  ): Promise<TemplateExportValue> {
    return {
      Value: exportValue,
    };
  }

  async insertTemplateExportValues(
    service: ServiceContext,
    exportValueMap: Record<string, TemplateExportValue>,
    template: ServerlessTemplatePreExports,
  ): Promise<ServerlessTemplatePostExports> {
    /* eslint-disable no-param-reassign */

    const resources = isObject(template.resources.Resources) ? template.resources.Resources : {};
    template.resources.Resources = resources;

    const outputs = isObject(resources.Outputs) ? resources.Outputs : {};
    resources.Outputs = {
      ...outputs,
      ...exportValueMap,
    };

    return template;
  }
}
