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

  /**
   * Copy Constructor
   */

  constructor(schemaFile: ServiceSchemaFile);

  constructor(schemaOrSchemaFile: ServiceSchemaFile | ServiceSchema, schemaFilePath?: string) {
    if (ServiceSchemaFile.isServiceSchemaFile(schemaOrSchemaFile)) {
      this.schema = schemaOrSchemaFile.schema;
      this.filePath = schemaOrSchemaFile.filePath;
    } else if (schemaFilePath !== undefined) {
      this.schema = schemaOrSchemaFile;
      this.filePath = schemaFilePath;
    } else {
      throw new Error("Invalid Service Schema File Constructor Overload");
    }
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
