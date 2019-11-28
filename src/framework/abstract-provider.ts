import {
  ServerlessProviderName, ServerlessTemplatePostExports, ServerlessTemplatePreExports,
} from "./templates";
import {
  APD, Framework, Service, Stack,
} from "./abstract-provider-definition";
import { ProcessedImportValue } from "./abstract-service-schema-properties";
import { ExportValue } from "./abstract-common-schema-properties";

interface AbstractProviderImportData<ProviderBasedData, DirectImportData> {
  "provider-based": ProviderBasedData;
  "direct-import": DirectImportData;
}

export abstract class AbstractProvider<
  D extends APD, // AbstractProviderDefinition
  ID extends AbstractProviderImportData<any, any>, // ProviderImportData
  TEV // TemplateExportValue
> {
  public abstract readonly name: ServerlessProviderName;

  private readonly framework: Framework<D>;

  public constructor(framework: Framework<D>) {
    this.framework = framework;
  }

  protected abstract retrieveServiceStack(
    service: Service<D>,
  ): Promise<Stack<D> | undefined>;

  public async getServiceStack(
    service: Service<D>,
  ): Promise<Stack<D>> {
    const stack = await this.retrieveServiceStack(service);

    if (stack === undefined) {
      throw new Error(`Service Stack "${service.name}" not found`);
    } else {
      return stack;
    }
  }

  public async isServiceDeployed(service: Service<D>): Promise<boolean> {
    return (await this.retrieveServiceStack(service)) !== undefined;
  }

  public abstract prepareTemplateProviderBasedImports(
    service: Service<D>,
    importedService: Service<D>,
  ): Promise<ID["provider-based"]>;

  public abstract prepareTemplateDirectImports(
    service: Service<D>,
    importedService: Service<D>,
  ): Promise<ID["direct-import"]>;

  public abstract retrieveTemplateProviderBasedImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"provider-based">,
    importData: ID["provider-based"],
  ): unknown;

  public abstract retrieveTemplateDirectImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"direct">,
    importData: ID["direct-import"],
  ): unknown;

  public abstract retrieveTemplateExportValue(
    service: Service<D>,
    exportName: string,
    exportValue: ExportValue,
  ): TEV;

  public abstract insertTemplateExportValues(
    service: Service<D>,
    exportTemplateValueMap: Record<string, TEV>,
    template: ServerlessTemplatePreExports,
  ): ServerlessTemplatePostExports;
}
