import { FrameworkSchemaFile } from "./framework-schema-file";
import { ServiceSchemaFile } from "./service-schema-file";
// eslint-disable-next-line import/no-cycle
import { ServiceContext } from "./service-context";
import { Provider } from "./provider";
import { ServerlessProviderName } from "../templates";
import { AwsProvider } from "./provider/aws";
import { ServiceSchema } from "./service-schema";

/* eslint-disable no-dupe-class-members */

export class FrameworkContext extends FrameworkSchemaFile {
  public readonly services: ServiceContext[];

  public readonly serviceSchemas: ServiceSchema[];

  public readonly provider: Provider;

  constructor(
    frameworkSchemaFile: FrameworkSchemaFile,
    serviceSchemaFiles: ServiceSchemaFile[],
  ) {
    super(frameworkSchemaFile);

    this.provider = FrameworkContext.getProviderFromName(this.schema.provider, this);

    // need to be set up before service contexts, since they use it in their constructor
    this.serviceSchemas = serviceSchemaFiles.map((service) => service.schema);

    // careful constructor programming needs to be done in service context, since the
    // service contexts are not available when they are constructed
    this.services = serviceSchemaFiles.map((file) => new ServiceContext(file, this));
  }

  /**
   * Looks up service context that the service identifier refers to.
   * Returns the found service if it exists.
   * Otherwise returns null.
   */
  getService(serviceIdentifier: string): ServiceContext | undefined;

  /**
   * Looks up service context that the service schema refers to.
   * Returns the found service if it exists.
   * Otherwise returns null.
   */
  getService(serviceSchema: ServiceSchema): ServiceContext | undefined;

  getService(serviceReference: string | ServiceSchema): ServiceContext | undefined {
    return this.services.find(
      (service) => service.schema.isReferredToBy(
        typeof serviceReference === "string" ? serviceReference : serviceReference.identifier,
      ),
    );
  }

  /**
   * Looks up service context that the service identifier refers to.
   * Returns the found service if it exists.
   * Otherwise throws error.
   */
  referenceService(serviceIdentifier: string): ServiceContext;

  /**
   * Looks up service context that the service schema refers to.
   * Returns the found service if it exists.
   * Otherwise throws error.
   */
  referenceService(serviceSchema: ServiceSchema): ServiceContext;

  referenceService(serviceReference: string | ServiceSchema): ServiceContext {
    const service = typeof serviceReference === "string"
      ? this.getService(serviceReference) : this.getService(serviceReference);

    if (service === undefined) {
      throw new Error(
        `Service "${serviceReference}" is references but does not exist`,
      );
    } else {
      return service;
    }
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
