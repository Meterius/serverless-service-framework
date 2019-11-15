import { FrameworkSchemaFile } from "./framework-schema-file";
import { ServiceSchemaFile } from "./service-schema-file";
// eslint-disable-next-line import/no-cycle
import { ServiceContext } from "./service-context";

function verifyServiceNames(
  frameworkSchemaFile: FrameworkSchemaFile,
  serviceSchemaFiles: ServiceSchemaFile[],
): void {
  const usedNames: Record<string, boolean> = {};

  serviceSchemaFiles.forEach((serviceSchemaFile) => {
    const { name, shortName } = serviceSchemaFile.schema;

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

export class FrameworkContext extends FrameworkSchemaFile {
  public readonly services: ServiceContext[];

  constructor(
    frameworkSchemaFile: FrameworkSchemaFile,
    serviceSchemaFiles: ServiceSchemaFile[],
  ) {
    super(frameworkSchemaFile);

    this.services = serviceSchemaFiles.map((file) => new ServiceContext(file, this));

    verifyServiceNames(frameworkSchemaFile, serviceSchemaFiles);
  }

  getService(serviceName: string): ServiceContext | undefined {
    return this.services.find(
      (service) => service.schema.name === serviceName
        || service.schema.shortName === serviceName,
    );
  }

  public static async loadFrameworkContext(
    frameworkSchemaFile: FrameworkSchemaFile,
  ): Promise<FrameworkContext> {
    const serviceSchemaFiles = await frameworkSchemaFile.loadServiceSchemaFiles();

    return new FrameworkContext(frameworkSchemaFile, serviceSchemaFiles);
  }
}
