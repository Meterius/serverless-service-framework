import path from "path";
import { ServiceSchema } from "./service-schema";
import { loadSchemaFile } from "../schema-file-handling";
import { isObject } from "../../common/type-guards";
import { serviceBuildDir } from "../constants";

/* eslint-disable no-dupe-class-members, @typescript-eslint/unbound-method */

export class ServiceSchemaFile extends ServiceSchema {
  private readonly __isServiceSchemaFile = true;

  public readonly filePath: string;

  public readonly dirPath: string;

  constructor(schema: ServiceSchema, schemaFilePath: string);

  constructor(serviceSchemaFile: ServiceSchemaFile);

  constructor(arg0: ServiceSchemaFile | ServiceSchema, arg1?: string) {
    super(arg0);

    if (ServiceSchemaFile.isServiceSchemaFile(arg0)) {
      this.filePath = arg0.filePath;
      this.dirPath = arg0.dirPath;
    } else if (typeof arg1 === "string") {
      this.filePath = arg1;
      this.dirPath = path.dirname(arg1);
    } else {
      throw new Error("Invalid ServiceSchemaFile constructor overload");
    }
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
