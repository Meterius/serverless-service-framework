import {
  ServerlessProviderName, ServerlessTemplatePostExports, ServerlessTemplatePreExports,
} from "../templates";
import { FrameworkContext } from "./framework-context";
import { ServiceContext } from "./service-context";
import { ExportValue, ProcessedImportValue } from "./common-schema";

export abstract class Provider<TemplateExportValue = unknown> {
  public abstract readonly name: ServerlessProviderName;

  private readonly context: FrameworkContext;

  public constructor(context: FrameworkContext) {
    this.context = context;
  }

  public abstract retrieveTemplateImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importValue: ProcessedImportValue,
  ): Promise<unknown>;

  public abstract retrieveTemplateExportValue(
    service: ServiceContext,
    exportName: string,
    exportValue: ExportValue,
  ): Promise<TemplateExportValue>;

  public abstract insertTemplateExportValues(
    service: ServiceContext,
    exportTemplateValueMap: Record<string, TemplateExportValue>,
    template: ServerlessTemplatePreExports,
  ): Promise<ServerlessTemplatePostExports>;
}
