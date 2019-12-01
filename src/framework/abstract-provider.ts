import {
  ServerlessProviderName, ServerlessTemplatePostExports, ServerlessTemplatePreExports,
} from "./templates";
import {
  APD, BaseParameter, Framework, Service, Stack,
} from "./abstract-provider-definition";
import { ProcessedImportValue } from "./abstract-service-schema-properties";
import { ExportValue } from "./abstract-common-schema-properties";
import { AbstractBase } from "./abstract-base";

interface AbstractProviderImportData<ProviderBasedData, DirectImportData> {
  "provider-based": ProviderBasedData;
  "direct-import": DirectImportData;
}

export abstract class AbstractProvider<
  D extends APD, // AbstractProviderDefinition
  ID extends AbstractProviderImportData<any, any>, // ProviderImportData
  TEV // TemplateExportValue
> extends AbstractBase<D> {
  abstract readonly name: ServerlessProviderName;

  protected readonly framework: Framework<D>;

  constructor(
    base: BaseParameter<D>,
    framework: Framework<D>,
  ) {
    super(base);

    this.framework = framework;
  }

  protected abstract retrieveServiceStack(
    service: Service<D>,
  ): Promise<Stack<D> | undefined>;

  async getServiceStack(
    service: Service<D>,
  ): Promise<Stack<D>> {
    const stack = await this.retrieveServiceStack(service);

    if (stack === undefined) {
      throw new Error(`Service Stack "${service.name}" not found`);
    } else {
      return stack;
    }
  }

  async isServiceDeployed(service: Service<D>): Promise<boolean> {
    return (await this.retrieveServiceStack(service)) !== undefined;
  }

  abstract prepareTemplateProviderBasedImports(
    service: Service<D>,
    importedService: Service<D>,
  ): Promise<ID["provider-based"]>;

  abstract prepareTemplateDirectImports(
    service: Service<D>,
    importedService: Service<D>,
  ): Promise<ID["direct-import"]>;

  abstract retrieveTemplateProviderBasedImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"provider-based">,
    importData: ID["provider-based"],
  ): unknown;

  abstract retrieveTemplateDirectImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"direct">,
    importData: ID["direct-import"],
  ): unknown;

  abstract retrieveTemplateExportValue(
    service: Service<D>,
    exportName: string,
    exportValue: ExportValue,
  ): TEV;

  abstract insertTemplateExportValues(
    service: Service<D>,
    exportTemplateValueMap: Record<string, TEV>,
    template: ServerlessTemplatePreExports,
  ): ServerlessTemplatePostExports;
}
