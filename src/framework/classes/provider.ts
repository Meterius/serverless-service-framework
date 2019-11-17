import {
  ServerlessProviderName,
} from "../templates";
import { FrameworkContext } from "./framework-context";
import { ServiceContext } from "./service-context";
import { ProcessedImportValue } from "./common-schema";

export abstract class Provider {
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
}
