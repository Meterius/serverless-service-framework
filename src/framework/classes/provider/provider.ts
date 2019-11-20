import {
  ServerlessProviderName, ServerlessTemplatePostExports, ServerlessTemplatePreExports,
} from "../../templates.types";
import { FrameworkContext } from "../framework-context";
import { ServiceContext } from "../service-context";
import { ExportValue, ProcessedImportValue } from "../types/common-schema.types";

export abstract class ProviderImplementation<
  TemplateExportValue = any, Stack = any, ProviderBasedImportData = any, DirectImportData = any,
> {
  public abstract readonly name: ServerlessProviderName;

  private readonly context: FrameworkContext;

  public constructor(context: FrameworkContext) {
    this.context = context;
  }

  protected abstract retrieveServiceStack(service: ServiceContext): Promise<Stack | undefined>;

  public abstract retrieveStackExports(
    stack: Stack,
  ): Record<string, string | undefined>;

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
