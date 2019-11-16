import mkdirp from "mkdirp";
import path from "path";
import fs from "fs";
import merge from "deepmerge";
// eslint-disable-next-line import/no-cycle
import { FrameworkContext } from "./framework-context";
import { ServiceSchemaFile } from "./service-schema-file";
import {
  PostCompilationServerlessTemplate, PreCompilationServerlessTemplate,
  ServerlessTemplatePostImports,
  ServerlessTemplatePostMerging, ServerlessTemplatePostNaming,
  ServerlessTemplatePostPreparation, ServerlessTemplatePreImports,
  ServerlessTemplatePreMerging, ServerlessTemplatePreNaming,
  ServerlessTemplatePrePreparation,
} from "../templates";
import { serviceBuild } from "../constants";

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

  constructor(schemaFile: ServiceSchemaFile, frameworkContext: FrameworkContext) {
    super(schemaFile);

    this.context = frameworkContext;
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
    // eslint-disable-next-line no-template-curly-in-string
    return "${self:service.name}-${self:provider.stage}";
  }

  private getTemplateProviderStage(): string {
    // eslint-disable-next-line no-template-curly-in-string
    return "${opt:service}";
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
        stage: this.getTemplateProviderStackName(),
        stackName: this.getTemplateProviderStage(),
      },
    };
  }

  private async processServiceServerlessTemplateImports(
    template: ServerlessTemplatePreImports,
  ): Promise<ServerlessTemplatePostImports> {
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

      const importData = await this.context.provider.retrieveImportData(this, importedService);

      const importedValues = importMap[importedServiceName];

      for (let j = 0; j < importedValues.length; j += 1) {
        const importValue = importedValues[j];

        importValueMap[importValue.name] = await this.context.provider.retrieveTemplateImportValue(
          this, importedService, importData, importValue,
        );
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

  /**
   * Builds serverless template used for service.
   * Returns the built template.
   */
  async buildServiceServerlessTemplateInMemory(

  ): Promise<PostCompilationServerlessTemplate> {
    const step0: PreCompilationServerlessTemplate = {};
    const step1 = await this.processServiceServerlessTemplateMerging(step0);
    const step2 = await this.processServiceServerlessTemplatePreperation(step1);
    const step3 = await this.processServiceServerlessTemplateNaming(step2);
    const step4 = await this.processServiceServerlessTemplateImports(step3);

    return step4;
  }

  /**
   * Builds serverless template used for service and writes it to disk.
   * Returns the file path of the written template file.
   */
  async buildServiceServerlessTemplate(): Promise<string> {
    const template = await this.buildServiceServerlessTemplateInMemory();
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
}
