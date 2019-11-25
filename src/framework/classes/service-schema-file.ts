import path from "path";
import { ServiceSchema } from "./service-schema";
import { loadSchemaPropertiesFiles } from "../file-handling";
import { serviceBuildDir } from "../../common/constants";
import { FrameworkSchemaFile } from "./framework-schema-file";
import { ServiceSchemaProperties } from "./types/service-schema.types";

/* eslint-disable no-dupe-class-members, @typescript-eslint/unbound-method */

export class ServiceSchemaFile {
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

  resolveServicePath(relPath: string): string {
    return path.join(this.dirPath, relPath);
  }

  getServiceBuildDir(): string {
    return this.resolveServicePath(serviceBuildDir);
  }

  protected resolveServiceBuildPath(relPath: string): string {
    return path.join(this.getServiceBuildDir(), relPath);
  }

  public static async loadServiceSchemaFiles(
    filePaths: string[], frameworkSchemaFile: FrameworkSchemaFile,
  ): Promise<ServiceSchemaFile[]> {
    const schemas: ServiceSchemaProperties[] = await loadSchemaPropertiesFiles(
      filePaths,
      ServiceSchema.ensureServiceSchemaProperties,
      frameworkSchemaFile.schema.options,
    );

    return schemas.map(
      (schema, index) => new ServiceSchemaFile(
        new ServiceSchema(frameworkSchemaFile.schema, schema), filePaths[index],
      ),
    );
  }
}
