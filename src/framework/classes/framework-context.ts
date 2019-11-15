import { FrameworkSchemaFile } from "./framework-schema-file";
import { ServiceSchemaFile } from "./service-schema-file";
// eslint-disable-next-line import/no-cycle
import { ServiceContext } from "./service-context";
import { Provider } from "./provider";
import { ServerlessProviderName } from "../templates";
import { AwsProvider } from "./provider/aws";

export class FrameworkContext extends FrameworkSchemaFile {
  public readonly services: ServiceContext[];

  public readonly provider: Provider;

  constructor(
    frameworkSchemaFile: FrameworkSchemaFile,
    serviceSchemaFiles: ServiceSchemaFile[],
  ) {
    super(frameworkSchemaFile);

    this.services = serviceSchemaFiles.map((file) => new ServiceContext(file, this));

    FrameworkContext.verifyServiceNames(frameworkSchemaFile, serviceSchemaFiles);

    this.provider = FrameworkContext.getProviderFromName(this.schema.provider, this);
  }

  getService(serviceName: string): ServiceContext | undefined {
    return this.services.find(
      (service) => service.schema.name === serviceName
        || service.schema.shortName === serviceName,
    );
  }

  private static verifyServiceNames(
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

  private static getProviderFromName(
    name: ServerlessProviderName, context: FrameworkContext,
  ): Provider {
    switch (name) {
      case "aws":
        return new AwsProvider(context);

      default:
        throw new Error(`Unknown provider "${name}"`);
    }
  }

  public static async loadFrameworkContext(
    frameworkSchemaFile: FrameworkSchemaFile,
  ): Promise<FrameworkContext> {
    const serviceSchemaFiles = await frameworkSchemaFile.loadServiceSchemaFiles();

    return new FrameworkContext(frameworkSchemaFile, serviceSchemaFiles);
  }
}
