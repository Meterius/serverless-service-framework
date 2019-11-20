import mkdirp from "mkdirp";
import path from "path";
import fs from "fs";
import { merge } from "../../common/utility";
// eslint-disable-next-line import/no-cycle
import { FrameworkContext } from "./framework-context";
import { ServiceSchemaFile } from "./service-schema-file";
import {
  PostCompilationServerlessTemplate,
  PreCompilationServerlessTemplate,
  ServerlessTemplate,
  ServerlessTemplatePostExports,
  ServerlessTemplatePostImports,
  ServerlessTemplatePostMerging,
  ServerlessTemplatePostNaming,
  ServerlessTemplatePostPreparation,
  ServerlessTemplatePreExports,
  ServerlessTemplatePreImports,
  ServerlessTemplatePreMerging,
  ServerlessTemplatePreNaming,
  ServerlessTemplatePrePreparation,
} from "../templates.types";
import { serviceBuild } from "../constants";
import { ServiceSchema } from "./service-schema";

/* eslint-disable class-methods-use-this */

export enum ServerlessTemplateFormat {
  JavaScript = "js"
}

export interface SerializedServerlessTemplate {
  data: string;
  format: ServerlessTemplateFormat;
}

export class ServiceContext extends ServiceSchemaFile {
  public readonly context: FrameworkContext;

  private readonly __importedServices: ServiceSchema[];

  private readonly __exportedToServices: ServiceSchema[];

  private __serverlessTemplate: ServerlessTemplate | null = null;

  constructor(
    frameworkContext: FrameworkContext,
    originalSchemaFile: ServiceSchemaFile,
  ) {
    super(originalSchemaFile);

    // note that the framework context calls this constructor
    // and that it will not have initialized the services attribute yet
    // i.e. only references to service schemas can be used here and no properties
    // that use service contexts

    this.context = frameworkContext;

    const {
      importedServices, exportedToServices,
    } = ServiceContext.computeLocalizedServicesDependencies(
      this.schema, frameworkContext.serviceSchemas,
    );

    this.__exportedToServices = exportedToServices;
    this.__importedServices = importedServices;
  }

  get name(): string {
    return this.schema.name;
  }

  get stackName(): string {
    return `${this.context.schema.shortName}-${this.schema.shortName}-${this.context.stage}`;
  }

  get region(): string {
    return (this.schema.template.provider || {}).region
      || this.context.schema.template.provider.region;
  }

  get importedServices(): ServiceContext[] {
    return this.__importedServices.map((schema) => this.context.referenceService(schema));
  }

  get exportedToServices(): ServiceContext[] {
    return this.__exportedToServices.map((schema) => this.context.referenceService(schema));
  }

  /**
   * Writes file into service build directory and creates necessary directories.
   * Returns absolute file path of written file.
   */
  private async writeServiceBuildFile(
    relPath: string,
    fileData: string,
  ): Promise<string> {
    const filePath = this.resolveServiceBuildPath(relPath);

    await new Promise((resolve, reject) => {
      mkdirp(path.dirname(filePath), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      fs.writeFile(filePath, fileData, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return filePath;
  }

  /**
   * Writes serialized serverless template to service build directory.
   * Returns absolute file path of written template file.
   */
  private writeSerializedServerlessTemplate(
    serializedTemplate: SerializedServerlessTemplate,
  ): Promise<string> {
    return this.writeServiceBuildFile(
      `${serviceBuild.serverlessTemplate}.${serializedTemplate.format}`,
      serializedTemplate.data,
    );
  }

  private getTemplateServiceName(): string {
    return `${this.context.schema.shortName}-${this.schema.shortName}`;
  }

  private getTemplateProviderStackName(): string {
    return this.stackName;
  }

  private getTemplateProviderStage(): string {
    return this.context.stage;
  }

  private async processServiceServerlessTemplateMerging(
    template: ServerlessTemplatePreMerging,
  ): Promise<ServerlessTemplatePostMerging> {
    const templateWithFramework = merge(
      template,
      this.context.schema.template,
    );

    return merge(
      templateWithFramework,
      this.schema.template,
    );
  }

  private async processServiceServerlessTemplatePreperation(
    template: ServerlessTemplatePrePreparation,
  ): Promise<ServerlessTemplatePostPreparation> {
    return {
      ...template,
      service: template.service || {},
      custom: template.custom || {},
      resources: template.resources || {},
    };
  }

  private async processServiceServerlessTemplateNaming(
    template: ServerlessTemplatePreNaming,
  ): Promise<ServerlessTemplatePostNaming> {
    return {
      ...template,
      service: {
        ...template.service,
        name: this.getTemplateServiceName(),
      },

      provider: {
        ...template.provider,
        stage: this.getTemplateProviderStage(),
        stackName: this.getTemplateProviderStackName(),
      },
    };
  }

  private async processServiceServerlessTemplateImports(
    template: ServerlessTemplatePreImports,
  ): Promise<ServerlessTemplatePostImports> {
    const { provider } = this.context;

    const { importMap } = this.schema;
    const importedServices = Object.keys(importMap);

    const importValueMap: Record<string, unknown> = {};

    for (let i = 0; i < importedServices.length; i += 1) {
      const importedServiceName = importedServices[i];
      const importedService = this.context.getService(importedServiceName);

      if (importedService === undefined) {
        throw new Error(
          `Service "${this.schema.name}" imports non-existent service "${importedServiceName}"`,
        );
      }

      const importedValues = importMap[importedServiceName];

      const directImportedValues = ServiceSchema.filterImportValuesByType(
        importedValues, "direct",
      );

      if (directImportedValues.length > 0) {
        const directImportData = await provider.prepareTemplateDirectImports(
          this, importedService,
        );

        directImportedValues.forEach((importValue) => {
          importValueMap[importValue.name] = provider.retrieveTemplateDirectImportValue(
            this, importedService, importValue, directImportData,
          );
        });
      }

      const providerBasedImportedValues = ServiceSchema.filterImportValuesByType(
        importedValues, "provider-based",
      );

      if (providerBasedImportedValues.length > 0) {
        const providerBasedImportData = await provider.prepareTemplateProviderBasedImports(
          this, importedService,
        );

        providerBasedImportedValues.forEach((importValue) => {
          importValueMap[importValue.name] = provider.retrieveTemplateProviderBasedImportValue(
            this, importedService, importValue, providerBasedImportData,
          );
        });
      }
    }

    return {
      ...template,
      custom: {
        ...template.custom,
        imports: importValueMap,
      },
    };
  }

  private async processServiceServerlessTemplateExports(
    template: ServerlessTemplatePreExports,
  ): Promise<ServerlessTemplatePostExports> {
    const exportTemplateValueMap: Record<string, any> = {};

    const entries = Object.entries(this.schema.exportMap);
    for (let i = 0; i < entries.length; i += 1) {
      const [exportName, exportValue] = entries[i];

      exportTemplateValueMap[exportName] = this.context.provider.retrieveTemplateExportValue(
        this, exportName, exportValue,
      );
    }

    return this.context.provider.insertTemplateExportValues(
      this, exportTemplateValueMap, template,
    );
  }

  importsService(otherService: ServiceContext): boolean {
    return this.importedServices.includes(otherService);
  }

  exportedToService(otherService: ServiceContext): boolean {
    return this.exportedToServices.includes(otherService);
  }

  /**
   * Builds serverless template used for service.
   * Returns the built template. (caches built)
   */
  async getServerlessTemplate(): Promise<ServerlessTemplate> {
    if (this.__serverlessTemplate === null) {
      this.__serverlessTemplate = await this.buildServiceServerlessTemplateInMemory();
    }

    return this.__serverlessTemplate;
  }

  /**
   * Builds serverless template used for service.
   * Returns the built template.
   */
  private async buildServiceServerlessTemplateInMemory(

  ): Promise<ServerlessTemplate> {
    const step0: PreCompilationServerlessTemplate = {};
    const step1 = await this.processServiceServerlessTemplateMerging(step0);
    const step2 = await this.processServiceServerlessTemplatePreperation(step1);
    const step3 = await this.processServiceServerlessTemplateNaming(step2);
    const step4 = await this.processServiceServerlessTemplateImports(step3);
    const step5 = await this.processServiceServerlessTemplateExports(step4);

    return step5;
  }

  /**
   * Builds serverless template used for service and writes it to disk.
   * Returns the file path of the written template file. (caches built)
   */
  async getServerlessTemplateFilePath(): Promise<string> {
    const template = await this.getServerlessTemplate();
    const serializedTemplate = await ServiceContext.serializeServiceServerlessTemplate(
      template, ServerlessTemplateFormat.JavaScript,
    );

    return this.writeSerializedServerlessTemplate(serializedTemplate);
  }

  /**
   * Serializes serverless template to supported file format.
   * Returns data and used format for the file.
   */
  private static async serializeServiceServerlessTemplate(
    template: PostCompilationServerlessTemplate, // which template will be serialized
    format: ServerlessTemplateFormat, // which file format will be generated
  ): Promise<SerializedServerlessTemplate> {
    if (format === ServerlessTemplateFormat.JavaScript) {
      return {
        data: `module.exports = ${JSON.stringify(template, undefined, " ")};`,
        format,
      };
    } else {
      throw new Error("Invalid Template Format");
    }
  }

  private static computeLocalizedServicesDependencies(
    serviceSchema: ServiceSchema, serviceSchemas: ServiceSchema[],
  ): { importedServices: ServiceSchema[]; exportedToServices: ServiceSchema[] } {
    const importedServices = serviceSchemas.filter(
      (otherService) => serviceSchema.isImporting(otherService),
    );

    const exportedToServices = serviceSchemas.filter(
      (otherService) => serviceSchema.isExportedTo(otherService),
    );

    return {
      importedServices, exportedToServices,
    };
  }
}
