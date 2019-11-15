import mkdirp from "mkdirp";
import path from "path";
import fs from "fs";
import merge from "deepmerge";
// eslint-disable-next-line import/no-cycle
import { FrameworkContext } from "./framework-context";
import { ServiceSchemaFile } from "./service-schema-file";
import { InlineServerlessTemplate } from "../types";
import { serviceBuild } from "../constants";

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

  /**
   * Builds (in memory) serverless template used for service.
   * Returns the built template.
   */
  private async buildServiceServerlessTemplate(): Promise<InlineServerlessTemplate> {
    const serviceTemplate = this.schema.template;
    const frameworkSchema = this.context.schema;
    const frameworkTemplate = frameworkSchema.template;

    return merge.all([
      frameworkTemplate,
      serviceTemplate,
      {
        service: {
          name: `${frameworkSchema.shortName}-${this.schema.shortName}`,
        },
      },
    ]);
  }

  /**
   * Builds serverless template used for service and writes it to build directory.
   * Returns absolute file path of written template file.
   */
  async compileServiceServerlessTemplate(): Promise<string> {
    const template = await this.buildServiceServerlessTemplate();
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
    template: InlineServerlessTemplate, // which template will be serialized
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
