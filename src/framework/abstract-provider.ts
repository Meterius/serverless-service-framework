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
  "direct-import": DirectImportData;
}

export abstract class AbstractProvider<
  D extends APD, // AbstractProviderDefinition
  ID extends AbstractProviderImportData<any, any>, // ProviderImportData
  TEV, // TemplateExportValue
  DIV // DirectImportValue
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

  abstract retrieveServiceStack(
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

  async getDirectImportValues<K extends string[]>(
    service: Service<D>,
    ...keys: K
  ): Promise<Record<K extends (infer V)[] ? V : string, DIV>> {
    const directImportMap: any = {};

    const servicePreps: Record<string, ID["direct-import"] | undefined> = {};

    const requestedImportValues: [Service<D>, ProcessedImportValue<"direct">][] = keys.map((key) => {
      const serviceIds = Object.keys(service.schema.importMap);

      for (let i = 0; i < serviceIds.length; i += 1) {
        const serviceId = serviceIds[i];
        const importValues = service.schema.importMap[serviceId];

        for (let j = 0; j < importValues.length; j += 1) {
          const importValue = importValues[j];

          if (importValue.name === key) {
            if (importValue.type === "direct") {
              return [this.framework.referenceService(serviceId), importValue];
            } else {
              throw new Error(
                `Tried to retrieve value of imported "${key}" in`
                + ` service "${service.name}" but it is not imported via direct-import`,
              );
            }
          }
        }
      }

      throw new Error(
        `Tried to retrieve value of imported "${key}" in service "${service.name}" but it is not imported`,
      );
    });

    for (let i = 0; i < requestedImportValues.length; i += 1) {
      const [importedService, importValue] = requestedImportValues[i];

      if (servicePreps[importedService.name] === undefined) {
        const prep = await this.prepareTemplateDirectImports(
          service, importedService, false,
        );

        if (prep === undefined) {
          throw new Error(
            `Tried to retrieve imports from service "${importedService.name}"`
            + ` in "${service.name}" but "${importedService.name}" is not deployed yet`,
          );
        } else {
          servicePreps[importedService.name] = prep;
        }
      }

      directImportMap[importValue.name] = this.retrieveTemplateDirectImportValue(
        service, importedService, importValue, servicePreps[importedService.name],
      );
    }

    return directImportMap;
  }

  async retrieveDirectImportValues<K extends string[]>(
    service: Service<D>,
    ...keys: K
  ): Promise<Record<K extends (infer V)[] ? V : string, DIV> | undefined> {
    try {
      return (await this.getDirectImportValues(service, ...keys));
    } catch (err) {
      return undefined;
    }
  }

  abstract prepareTemplateDirectImports(
    service: Service<D>,
    importedService: Service<D>,
    throwIfNotDeployed?: true,
  ): Promise<ID["direct-import"]>;

  abstract prepareTemplateDirectImports(
    service: Service<D>,
    importedService: Service<D>,
    throwIfNotDeployed: false,
  ): Promise<ID["direct-import"] | undefined>;

  abstract prepareTemplateDirectImports(
    service: Service<D>,
    importedService: Service<D>,
    throwIfNotDeployed?: boolean,
  ): Promise<ID["direct-import"] | undefined>;

  abstract retrieveTemplateProviderBasedImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"provider-based">,
  ): unknown;

  abstract retrieveTemplateDirectImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"direct">,
    importData: ID["direct-import"],
  ): DIV;

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
