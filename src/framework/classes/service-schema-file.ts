import path from "path";
import { ServiceSchema, ServiceSchemaProperties } from "./service-schema";
import { loadSchemaPropertiesFile } from "../schema-file-handling";
import { serviceBuildDir } from "../constants";
import { FrameworkSchemaFile } from "./framework-schema-file";

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

  constructor(schemaOrSchemaFile: ServiceSchema | ServiceSchemaFile, filePath?: string) {
    if (schemaOrSchemaFile instanceof ServiceSchemaFile) {
      this.schema = schemaOrSchemaFile.schema;
      this.filePath = schemaOrSchemaFile.filePath;
    } else if (filePath !== undefined) {
      this.schema = schemaOrSchemaFile;
      this.filePath = filePath;
    } else {
      throw new Error("Invalid Service Schema File Constructor");
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

  public static async loadServiceSchemaFile(
    filePath: string, frameworkSchemaFile: FrameworkSchemaFile,
  ): Promise<ServiceSchemaFile> {
    const schema: ServiceSchemaProperties = await loadSchemaPropertiesFile(
      filePath, ServiceSchema.isServiceSchemaProperties, "ServiceSchema class",
    );

    return new ServiceSchemaFile(new ServiceSchema(frameworkSchemaFile.schema, schema), filePath);
  }
}
