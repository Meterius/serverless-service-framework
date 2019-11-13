import path from "path";
import { FrameworkSchema } from "./framework-schema";
import { findMatchingFile, getSubDirectories, loadSchemaFile } from "../file-handling";
import {
  frameworkSchemaExtensions,
  frameworkSchemaNames,
  serviceSchemaExtensions,
  serviceSchemaNames,
} from "../constants";
import { ServiceSchemaFile } from "./service-schema-file";
import { FrameworkContext, createFrameworkContext } from "./framework-context";
import { isObject } from "../../common/utility";

/* eslint-disable no-dupe-class-members, @typescript-eslint/unbound-method */

export class FrameworkSchemaFile extends FrameworkSchema {
  private readonly __isFrameworkSchemaFile = true;

  public readonly filePath: string;

  public readonly dirPath: string;

  constructor(schema: FrameworkSchema, schemaFilePath: string) {
    super(schema.params);

    this.filePath = schemaFilePath;
    this.dirPath = path.dirname(schemaFilePath);
  }

  private get serviceRootDirPath(): string {
    return this.resolveFrameworkPath(this.params.serviceRootDir);
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

  private async loadServiceSchemaFiles(): Promise<ServiceSchemaFile[]> {
    const serviceSchemaFiles = await this.getServiceSchemaFilePaths();

    return Promise.all(
      serviceSchemaFiles.map(
        (filePath) => ServiceSchemaFile.loadServiceSchemaFile(filePath),
      ),
    );
  }

  public async loadFrameworkContext(): Promise<FrameworkContext> {
    const serviceSchemaFiles = await this.loadServiceSchemaFiles();

    return createFrameworkContext(this, serviceSchemaFiles);
  }

  public static async loadFrameworkSchemaFile(filePath: string): Promise<FrameworkSchemaFile> {
    const schema = await loadSchemaFile(
      filePath, FrameworkSchema.isFrameworkSchema, "FrameworkSchema class",
    );
    return new FrameworkSchemaFile(schema, filePath);
  }

  public static isFrameworkSchemaFile(value: unknown): value is FrameworkSchemaFile {
    return isObject(value) && value.__isFrameworkSchemaFile === true;
  }

  public static getFrameworkSchemaFilePath(dirPath: string): Promise<string | undefined> {
    return findMatchingFile(dirPath, frameworkSchemaNames, frameworkSchemaExtensions);
  }
}
