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

  // eslint-disable-next-line no-dupe-class-members
  private __retrieveDirectImportValues<K extends string>(
    service: Service<D>,
    throwIfNotDeployedOrNotUpToDate: true,
    ...keys: K[]
  ): Promise<Record<K, DIV>>;

  // eslint-disable-next-line no-dupe-class-members
  private __retrieveDirectImportValues<K extends string>(
    service: Service<D>,
    throwIfNotDeployedOrNotUpToDate: false,
    ...keys: K[]
  ): Promise<Record<K, DIV> | undefined>;

  // eslint-disable-next-line no-dupe-class-members
  private async __retrieveDirectImportValues<K extends string>(
    service: Service<D>,
    throwIfNotDeployedOrNotUpToDate: boolean,
    ...keys: K[]
  ): Promise<Record<K, DIV> | undefined> {
    const directImportMap: Record<string, DIV> = {};

    const servicePreps: Record<string, ID["direct-import"] | undefined> = {};

    const requestedImportValues: [Service<D>, ProcessedImportValue<"direct">][] = [];

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      let value: undefined | [Service<D>, ProcessedImportValue<"direct">];

      const serviceIds = Object.keys(service.schema.importMap);

      for (let j = 0; j < serviceIds.length; j += 1) {
        const serviceId = serviceIds[j];
        const importValues = service.schema.importMap[serviceId];

        for (let k = 0; k < importValues.length; k += 1) {
          const importValue = importValues[k];

          if (importValue.name === key) {
            if (importValue.type === "direct") {
              value = [this.framework.referenceService(serviceId), importValue];
            } else {
              throw new Error(
                `Tried to retrieve value of import "${key}" from`
                  + ` service "${service.name}" but it does not import it via a direct import`,
              );
            }
          }
        }
      }

      if (value === undefined) {
        throw new Error(
          `Tried to retrieve value of import "${key}" from service "${service.name}"`
        + " but it does not have an import with that name",
        );
      } else {
        requestedImportValues.push(value);
      }
    }

    for (let i = 0; i < requestedImportValues.length; i += 1) {
      const [importedService, importValue] = requestedImportValues[i];

      if (servicePreps[importedService.name] === undefined) {
        const prep = await this.prepareTemplateDirectImports(
          service, importedService, false,
        );

        if (prep === undefined) {
          if (throwIfNotDeployedOrNotUpToDate) {
            throw new Error(
              `Tried to retrieve imports that service "${service.name}" imports from`
              + ` service "${importedService.name}" but service "${importedService.name}" is not deployed`,
            );
          } else {
            return undefined;
          }
        } else {
          servicePreps[importedService.name] = prep;
        }
      }

      const directImportValue = this.retrieveTemplateDirectImportValue(
        service, importedService, importValue, servicePreps[importedService.name],
      );

      if (directImportValue === undefined) {
        if (throwIfNotDeployedOrNotUpToDate) {
          throw new Error(
            `Tried to retrieve import "${importValue.name}" that service "${service.name}" imports from`
            + ` service "${importedService.name}" but the deployed stack of "${importedService.name}"`
            + " is outdated and does not export it yet",
          );
        } else {
          return undefined;
        }
      }

      directImportMap[importValue.name] = directImportValue;
    }

    return directImportMap;
  }

  async retrieveDirectImportValues<K extends string>(
    service: Service<D>,
    ...keys: K[]
  ): Promise<Record<K, DIV> | undefined> {
    return this.__retrieveDirectImportValues(service, false, ...keys);
  }

  async getDirectImportValues<K extends string>(
    service: Service<D>,
    ...keys: K[]
  ): Promise<Record<K, DIV>> {
    return this.__retrieveDirectImportValues(service, true, ...keys);
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

  abstract getTemplateProviderBasedImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"provider-based">,
  ): unknown;

  abstract retrieveTemplateDirectImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"direct">,
    importData: ID["direct-import"],
  ): DIV | undefined;

  getTemplateDirectImportValue(
    service: Service<D>,
    importedService: Service<D>,
    importValue: ProcessedImportValue<"direct">,
    importData: ID["direct-import"],
  ): DIV {
    const value = this.retrieveTemplateDirectImportValue(service, importedService, importValue, importData);

    if (value === undefined) {
      throw new Error(
        `Service "${service.schema.name}" imports via direct import "${importValue.name}" `
        + `from "${importedService.schema.name}" that is not exported by the stack`,
      );
    } else {
      return value;
    }
  }

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
