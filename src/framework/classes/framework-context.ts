import { FrameworkSchemaFile } from "./framework-schema-file";
import { ServiceSchemaFile } from "./service-schema-file";
// eslint-disable-next-line import/no-cycle
import { ServiceContext } from "./service-context";
import { ServerlessProviderName } from "../templates";
import { AwsProvider } from "./provider/aws";
import { ServiceSchema } from "./service-schema";
import { ServiceSchemaCollection } from "./service-schema-collection";
import { filterObject } from "../../common/utility";
import { Provider } from "./provider";

/* eslint-disable no-dupe-class-members */

export class FrameworkContext extends FrameworkSchemaFile {
  public readonly services: ServiceContext[];

  public readonly serviceSchemas: ServiceSchema[];

  public readonly serviceCollection: ServiceSchemaCollection;

  public readonly provider: Provider;

  public readonly stage: string;

  constructor(
    frameworkSchemaFile: FrameworkSchemaFile,
    serviceSchemaFiles: ServiceSchemaFile[],
    stage: string,
  ) {
    super(frameworkSchemaFile);

    this.stage = stage;

    this.provider = FrameworkContext.getProviderFromName(this.schema.provider, this);

    // need to be set up before service contexts, since they use it in their constructor
    this.serviceSchemas = serviceSchemaFiles.map((service) => service.schema);

    // careful constructor programming needs to be done in service context, since the
    // service contexts are not available when they are constructed
    this.services = serviceSchemaFiles.map((file) => new ServiceContext(file, this));

    this.serviceCollection = new ServiceSchemaCollection(this.serviceSchemas);

    // ensures assumptions about a collection of service schemas
    // for example names are not reused, no imports cycles are contained, ...
    FrameworkContext.ensureValidity(this.serviceCollection);
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

  private static ensureValidity(collection: ServiceSchemaCollection): void {
    function joinC(arr: string[]): string {
      if (arr.length >= 2) {
        return arr.slice(0, arr.length - 2).concat(
          [`${arr[arr.length - 2]} and ${arr[arr.length - 1]}`],
        ).join(", ");
      } else {
        return arr[0] || "";
      }
    }

    function joinCQ(arr: string[]): string {
      return joinC(arr.map((str) => `"${str}"`));
    }

    const test1 = collection.getServicesWithoutUniqueIdentifiers();

    if (test1.length > 0) {
      throw new Error(
        `Services ${joinCQ(test1.map((s) => s.name))} have common short names or names`,
      );
    }

    const test2 = collection.getServiceImportsUsingNonExistentIdentifiers();
    const test2Item = test2.find((item) => item.nonExistentIdentifiersUsed.length > 0);

    if (test2Item !== undefined) {
      const missing = joinCQ(test2Item.nonExistentIdentifiersUsed);

      throw new Error(
        `Service "${test2Item.schema.name}" imports from ${missing} that does not exist`,
      );
    }

    const test3 = collection.getServiceImportsUsingNonDefaultIdentifier();
    const test3Item = test3.find((item) => item.nonDefaultIdentifiersUsed.length > 0);

    if (test3Item) {
      const nonDefaults = joinCQ(test3Item.nonDefaultIdentifiersUsed);

      throw new Error(
        `Service "${test3Item.schema.name}" imports ${nonDefaults} that isn't a services name"`,
      );
    }

    const test4 = collection.getServiceImportsNotExportedByTheOtherServices();

    const test4Item = test4.map((item) => ({
      schema: item.schema,
      notExportedImportsMap: filterObject(
        item.notExportedImportsMap, (list) => list.length > 0,
      ),
    })).find((item) => Object.values(item.notExportedImportsMap).length > 0);

    if (test4Item) {
      const [importedService, notExportedValues] = Object.entries(
        test4Item.notExportedImportsMap,
      )[0];

      const notExportedDisplay = joinCQ(notExportedValues.map((s) => s.name));

      throw new Error(
        `Service "${test4Item.schema.name}" tries to import ${notExportedDisplay} `
        + `from "${importedService}" which it does not export`,
      );
    }

    const test5 = collection.getCyclicImportChains().map((cycle) => cycle.concat([cycle[0]]));

    if (test5.length > 0) {
      const cycleDisplay = test5.length === 1 ? "Cycle" : "Cycles";

      const cycles = joinC(test5
        .map((cycle) => cycle.map((schema) => `"${schema.name}"`).join(" > "))
        .map((str) => `(${str})`));

      throw new Error(
        `Import ${cycleDisplay} ${cycles} found`,
      );
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
    stage: string,
  ): Promise<FrameworkContext> {
    const serviceSchemaFiles = await frameworkSchemaFile.loadServiceSchemaFiles();

    return new FrameworkContext(frameworkSchemaFile, serviceSchemaFiles, stage);
  }
}
