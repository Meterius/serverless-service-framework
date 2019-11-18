import path from "path";
import { FrameworkSchema } from "./framework-schema";
import { findMatchingFile, getSubDirectories } from "../../common/filesystem";
import {
  frameworkSchemaExtensions,
  frameworkSchemaNames,
  serviceSchemaExtensions,
  serviceSchemaNames,
} from "../constants";
import { ServiceSchemaFile } from "./service-schema-file";
import { loadSchemaPropertiesFile } from "../schema-file-handling";

/* eslint-disable no-dupe-class-members, @typescript-eslint/unbound-method */

export class FrameworkSchemaFile {
  private readonly __isFrameworkSchemaFile = true;

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

  private resolveFrameworkPath(relPath: string): string {
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
    const serviceSchemaFiles = await this.getServiceSchemaFilePaths();

    return Promise.all(
      serviceSchemaFiles.map(
        (filePath) => ServiceSchemaFile.loadServiceSchemaFile(filePath, this),
      ),
    );
  }

  public static async loadFrameworkSchemaFile(filePath: string): Promise<FrameworkSchemaFile> {
    const schema = await loadSchemaPropertiesFile(
      filePath, FrameworkSchema.isFrameworkSchemaProperties, "Framework Schema",
    );
    return new FrameworkSchemaFile(new FrameworkSchema(schema), filePath);
  }

  public static getFrameworkSchemaFilePath(dirPath: string): Promise<string | undefined> {
    return findMatchingFile(dirPath, frameworkSchemaNames, frameworkSchemaExtensions);
  }
}
