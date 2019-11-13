import { FrameworkSchemaFile } from "./framework-schema-file";
import { ServiceSchemaFile } from "./service-schema-file";
import { ServiceContext } from "./service-context";

function verifyServiceNames(
  frameworkSchemaFile: FrameworkSchemaFile,
  serviceSchemaFiles: ServiceSchemaFile[],
): void {
  const usedNames: Record<string, boolean> = {};

  serviceSchemaFiles.forEach((serviceSchemaFile) => {
    const { name, shortName } = serviceSchemaFile.params;

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

  public readonly services: ServiceContext[];

  constructor(
    frameworkSchemaFile: FrameworkSchemaFile,
    serviceSchemaFiles: ServiceSchemaFile[],
  ) {
    this.frameworkSchemaFile = frameworkSchemaFile;
    this.services = serviceSchemaFiles.map((file) => new ServiceContext(file, this));

    verifyServiceNames(frameworkSchemaFile, serviceSchemaFiles);
  }

  getService(serviceName: string): ServiceContext | undefined {
    return this.services.find(
      (service) => service.params.name === serviceName
        || service.params.shortName === serviceName,
    );
  }
}

export function createFrameworkContext(
  frameworkSchemaFile: FrameworkSchemaFile,
  serviceSchemaFiles: ServiceSchemaFile[],
): FrameworkContext {
  return new FrameworkContext(frameworkSchemaFile, serviceSchemaFiles);
}
