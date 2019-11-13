import { FrameworkSchemaFile, ServiceSchemaFile } from "./schema-handling";
import { FrameworkSchema, ServiceSchema } from "./schema";

function verifyServiceNames(
  frameworkSchemaFile: FrameworkSchemaFile,
  serviceSchemaFiles: ServiceSchemaFile[],
): void {
  const usedNames: Record<string, boolean> = {};

  serviceSchemaFiles.forEach((serviceSchemaFile) => {
    const { name, shortName } = serviceSchemaFile.schema.params;

    if (usedNames[name]) {
      throw new Error(`Name "${name}" is used multiple times`);
    } else if (usedNames[shortName]) {
      throw new Error(`Name "${shortName}" is used multiple times`);
    } else {
      usedNames[name] = true;
      usedNames[shortName] = true;
    }
  });
}

export class FrameworkContext {
  public readonly frameworkSchemaFile: FrameworkSchemaFile;

  public readonly serviceSchemaFiles: ServiceSchemaFile[];

  constructor(
    frameworkSchemaFile: FrameworkSchemaFile,
    serviceSchemaFiles: ServiceSchemaFile[],
  ) {
    this.frameworkSchemaFile = frameworkSchemaFile;
    this.serviceSchemaFiles = serviceSchemaFiles;

    verifyServiceNames(frameworkSchemaFile, serviceSchemaFiles);
  }

  get frameworkSchema(): FrameworkSchema {
    return this.frameworkSchemaFile.schema;
  }

  get serviceSchemas(): ServiceSchema[] {
    return this.serviceSchemaFiles.map((file) => file.schema);
  }

  getServiceSchemaFile(serviceName: string): ServiceSchemaFile | undefined {
    return this.serviceSchemaFiles.find(
      (file) => file.schema.params.name === serviceName
        || file.schema.params.shortName === serviceName,
    );
  }

  getServiceSchema(serviceName: string): ServiceSchema | undefined {
    const file = this.getServiceSchemaFile(serviceName);
    return file ? file.schema : undefined;
  }
}

export function createFrameworkContext(
  frameworkSchemaFile: FrameworkSchemaFile,
  serviceSchemaFiles: ServiceSchemaFile[],
): FrameworkContext {
  return new FrameworkContext(frameworkSchemaFile, serviceSchemaFiles);
}
