import path from "path";
import { FrameworkSchema } from "./framework-schema";
import { findMatchingFile, getSubDirectories } from "../../common/filesystem";
import {
  frameworkOptionsExtensions,
  frameworkOptionsNames,
  frameworkSchemaExtensions,
  frameworkSchemaNames,
  serviceSchemaExtensions,
  serviceSchemaNames,
} from "../../common/constants";
import { ServiceSchemaFile } from "./service-schema-file";
import { loadFrameworkOptionsFile, loadSchemaPropertiesFiles } from "../file-handling";
import { FrameworkOptions } from "./types/framework-options.types";

/* eslint-disable no-dupe-class-members, @typescript-eslint/unbound-method */

export class FrameworkSchemaFile {
  public readonly filePath: string;

  public readonly schema: FrameworkSchema;

  constructor(schema: FrameworkSchema, filePath: string);

  /**
   * Copy Constructor
   */
  constructor(schemaFile: FrameworkSchemaFile);

  constructor(schemaOrSchemaFile: FrameworkSchemaFile | FrameworkSchema, filePath?: string) {
    if (schemaOrSchemaFile instanceof FrameworkSchemaFile) {
      this.schema = schemaOrSchemaFile.schema;
      this.filePath = schemaOrSchemaFile.filePath;
    } else if (filePath !== undefined) {
      this.schema = schemaOrSchemaFile;
      this.filePath = filePath;
    } else {
      throw new Error("Invalid Framework Schema File Constructor Overload");
    }
  }

  get dirPath(): string {
    return path.dirname(this.filePath);
  }

  private get serviceRootDirPath(): string {
    return this.resolveFrameworkPath(this.schema.serviceRootDir);
  }

  public resolveFrameworkPath(relPath: string): string {
    return path.join(this.dirPath, relPath);
  }

  private getServiceDirectories(): Promise<string[]> {
    return getSubDirectories(this.serviceRootDirPath);
  }

  private async getServiceSchemaFilePaths(): Promise<string[]> {
    const dirs = await this.getServiceDirectories();

    return (await Promise.all(
      dirs.map((dir) => findMatchingFile(dir, serviceSchemaNames, serviceSchemaExtensions)),
    )).filter((filePath): filePath is string => typeof filePath === "string");
  }

  public async loadServiceSchemaFiles(): Promise<ServiceSchemaFile[]> {
    const serviceSchemaFilePaths = await this.getServiceSchemaFilePaths();

    return ServiceSchemaFile.loadServiceSchemaFiles(
      serviceSchemaFilePaths, this,
    );
  }

  public static loadFrameworkOptionsFile(
    optionsFilePath: string,
    frameworkFilePath: string,
  ): Promise<FrameworkOptions> {
    return loadFrameworkOptionsFile(optionsFilePath, path.dirname(frameworkFilePath));
  }

  public static async loadFrameworkSchemaFile(
    frameworkFilePath: string,
    frameworkOptions: FrameworkOptions,
  ): Promise<FrameworkSchemaFile> {
    const schema = (await loadSchemaPropertiesFiles(
      [frameworkFilePath], FrameworkSchema.ensureFrameworkSchemaProperties, frameworkOptions,
    ))[0];

    return new FrameworkSchemaFile(
      new FrameworkSchema(schema, frameworkOptions), frameworkFilePath,
    );
  }

  public static getFrameworkSchemaFilePath(dirPath: string): Promise<string | undefined> {
    return findMatchingFile(dirPath, frameworkSchemaNames, frameworkSchemaExtensions);
  }

  public static getFrameworkOptionsFilePath(dirPath: string): Promise<string | undefined> {
    return findMatchingFile(dirPath, frameworkOptionsNames, frameworkOptionsExtensions);
  }

  public static serialize(schemaFile: FrameworkSchemaFile): string {
    return JSON.stringify({
      filePath: schemaFile.filePath,
      encodedSchema: FrameworkSchema.serialize(schemaFile.schema),
    });
  }

  public static deserialize(encodedSchemaFile: string): FrameworkSchemaFile {
    const decoded = JSON.parse(encodedSchemaFile);

    return new FrameworkSchemaFile(
      FrameworkSchema.deserialize(decoded.encodedSchema),
      decoded.filePath,
    );
  }
}
