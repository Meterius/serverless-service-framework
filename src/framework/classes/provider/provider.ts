import {
  ServerlessProviderName, ServerlessTemplatePostExports, ServerlessTemplatePreExports,
} from "../../templates.types";
import { FrameworkContext } from "../framework-context";
import { ServiceContext } from "../service-context";
import { ExportValue, ProcessedImportValue } from "../types/common-schema.types";

export type Stack<D = any> = {
  service: ServiceContext;
  stackData: D;
};

export abstract class ProviderImplementation<
  TemplateExportValue = any, StackData = any, ProviderBasedImportData = any, DirectImportData = any,
> {
  public abstract readonly name: ServerlessProviderName;

  private readonly context: FrameworkContext;

  public constructor(context: FrameworkContext) {
    this.context = context;
  }

  protected abstract retrieveServiceStackData(
    service: ServiceContext,
  ): Promise<StackData | undefined>;

  public async retrieveServiceStack(
    service: ServiceContext,
  ): Promise<Stack<StackData> | undefined> {
    const stackData = await this.retrieveServiceStackData(service);

    if (stackData === undefined) {
      return undefined;
    } else {
      return {
        service, stackData,
      };
    }
  }

  public async getServiceStack(
    service: ServiceContext,
  ): Promise<Stack<StackData>> {
    const stack = await this.retrieveServiceStack(service);

    if (stack === undefined) {
      throw new Error(`Service Stack "${service.name}" not found`);
    } else {
      return stack;
    }
  }

  public async isServiceDeployed(service: ServiceContext): Promise<boolean> {
    return (await this.retrieveServiceStack(service)) !== undefined;
  }

  public abstract getStackExports(
    stack: Stack,
  ): Record<string, string | undefined>;

  public getStackExport(
    stack: Stack, exportName: string,
  ): string {
    const exportValue = this.getStackExports(stack)[exportName];

    if (exportValue === undefined) {
      throw new Error(`Export "${exportName}" of Service Stack "${stack.service.name}" not found`);
    } else {
      return exportValue;
    }
  }

  public abstract prepareTemplateProviderBasedImports(
    service: ServiceContext,
    importedService: ServiceContext,
  ): Promise<ProviderBasedImportData>;

  public abstract prepareTemplateDirectImports(
    service: ServiceContext,
    importedService: ServiceContext,
  ): Promise<DirectImportData>;

  public abstract retrieveTemplateProviderBasedImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importValue: ProcessedImportValue<"provider-based">,
    importData: ProviderBasedImportData,
  ): unknown;

  public abstract retrieveTemplateDirectImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importValue: ProcessedImportValue<"direct">,
    importData: DirectImportData,
  ): unknown;

  public abstract retrieveTemplateExportValue(
    service: ServiceContext,
    exportName: string,
    exportValue: ExportValue,
  ): TemplateExportValue;

  public abstract insertTemplateExportValues(
    service: ServiceContext,
    exportTemplateValueMap: Record<string, TemplateExportValue>,
    template: ServerlessTemplatePreExports,
  ): ServerlessTemplatePostExports;
}
