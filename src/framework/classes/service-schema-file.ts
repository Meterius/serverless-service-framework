import path from "path";
import { ServiceSchema } from "./service-schema";
import { loadSchemaFile } from "../schema-file-handling";
import { isObject } from "../../common/type-guards";
import { serviceBuildDir } from "../constants";

/* eslint-disable no-dupe-class-members, @typescript-eslint/unbound-method */

export class ServiceSchemaFile {
  private readonly __isServiceSchemaFile = true;

  public readonly filePath: string;

  public readonly schema: ServiceSchema;

  constructor(schema: ServiceSchema, schemaFilePath: string);

  constructor(newSchema: ServiceSchema, oldSchemaFile: ServiceSchemaFile);

  constructor(schema: ServiceSchema, schemaFileOrFilePath: string | ServiceSchemaFile) {
    this.filePath = ServiceSchemaFile.isServiceSchemaFile(schemaFileOrFilePath)
      ? schemaFileOrFilePath.filePath : schemaFileOrFilePath;

    this.schema = schema;
  }

  get dirPath(): string {
    return path.dirname(this.filePath);
  }

  protected resolveServicePath(relPath: string): string {
    return path.join(this.dirPath, relPath);
  }

  getServiceBuildDir(): string {
    return this.resolveServicePath(serviceBuildDir);
  }

  protected resolveServiceBuildPath(relPath: string): string {
    return path.join(this.getServiceBuildDir(), relPath);
  }

  public static async loadServiceSchemaFile(filePath: string): Promise<ServiceSchemaFile> {
    const schema = await loadSchemaFile(
      filePath, ServiceSchema.isServiceSchema, "ServiceSchema class",
    );

    return new ServiceSchemaFile(schema, filePath);
  }

  public static isServiceSchemaFile(value: unknown): value is ServiceSchemaFile {
    return isObject(value) && value.__isServiceSchemaFile === true;
  }
}
