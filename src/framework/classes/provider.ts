import {
  ServerlessProviderName,
} from "../templates";
import { FrameworkContext } from "./framework-context";
import { ServiceContext } from "./service-context";
import { ImportType, ProcessedImportValue } from "./common-schema";

export abstract class Provider<ImportData = unknown> {
  public abstract readonly name: ServerlessProviderName;

  private readonly context: FrameworkContext;

  private importDataMap: Record<string, ImportData | undefined> = {};

  protected constructor(context: FrameworkContext) {
    this.context = context;
  }

  public abstract retrieveImportData(
    service: ServiceContext,
    importedService: ServiceContext,
  ): Promise<ImportData>;

  public abstract retrieveTemplateImportValue(
    service: ServiceContext,
    importedService: ServiceContext,
    importData: ImportData,
    importValue: ProcessedImportValue,
  ): Promise<unknown>;
}
