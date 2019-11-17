import {
  ServerlessProviderName, ServerlessTemplatePostExports, ServerlessTemplatePreExports,
} from "../../templates";
import { FrameworkContext } from "../framework-context";
import { ServiceContext } from "../service-context";
import { ExportValue, ImportType, ProcessedImportValue } from "../common-schema";

export abstract class ProviderImplementation<
  TemplateExportValue = any, Stack = any, ProviderBasedImportData = any, DirectImportData = any,
> {
  public abstract readonly name: ServerlessProviderName;

  private readonly context: FrameworkContext;

  public constructor(context: FrameworkContext) {
    this.context = context;
  }

  protected abstract retrieveServiceStack(service: ServiceContext): Promise<Stack | undefined>;

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
    importValue: ProcessedImportValue<ImportType.ProviderBased>,
    importData: ProviderBasedImportData,
  ): unknown;

  public abstract retrieveTemplateDirectImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importValue: ProcessedImportValue<ImportType.Direct>,
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
