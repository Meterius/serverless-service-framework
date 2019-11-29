import {
  APD,
  FrameworkActionLogic,
  FrameworkSchema,
  Provider,
  Service,
  ServiceDefinition,
  ServiceSchema,
  ServiceSchemaCollection,
  FrameworkSchemaProperties,
  BaseCollection,
} from "./abstract-provider-definition";
import { FrameworkOptions } from "./framework-options";
import { filterObject } from "../common/utility";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractFramework<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  public readonly dirPath: string;

  public readonly services: Service<D>[] = [];

  public readonly provider: Provider<D>;

  public readonly stage: string;

  public readonly profile: string | undefined;

  public readonly actionLogic: FrameworkActionLogic<D>;

  public readonly schema: FrameworkSchema<D>;

  private readonly options: FrameworkOptions;

  protected constructor(
    base: BaseCollection<D>,
    dirPath: string,
    props: FrameworkSchemaProperties<D>,
    options: FrameworkOptions,
    stage: string,
    profile?: string,
  ) {
    super(base);

    this.dirPath = dirPath;
    this.options = options;
    this.stage = stage;
    this.profile = profile;

    this.schema = new this.classes.FrameworkSchema(
      props, options,
    );
    this.actionLogic = new this.classes.FrameworkActionLogic(this);
    this.provider = new this.classes.Provider(this);
  }

  get serviceSchemas(): ServiceSchema<D>[] {
    return this.services.map((service) => service.schema);
  }

  /**
   * Looks up service context that the service identifier refers to.
   * Returns the found service if it exists.
   * Otherwise returns null.
   */
  getService(serviceIdentifier: string): Service<D> | undefined {
    return this.services.find(
      (service) => service.schema.isReferredToBy(serviceIdentifier),
    );
  }

  /**
   * Looks up service context that the service identifier refers to.
   * Returns the found service if it exists.
   * Otherwise throws error.
   */
  referenceService(serviceIdentifier: string): Service<D> {
    const service = this.getService(serviceIdentifier);

    if (service === undefined) {
      throw new Error(
        `Service "${serviceIdentifier}" is referenced but does not exist`,
      );
    } else {
      return service;
    }
  }

  addServices(
    serviceDefinitions: ServiceDefinition<D>[],
  ): void {
    const newServices = serviceDefinitions.map(
      (
        { dirPath, props, hookMap },
      ) => new this.classes.Service(this, props, dirPath, hookMap),
    );

    const serviceSchemas = this.serviceSchemas.concat(
      newServices.map((service) => service.schema),
    );

    const collection = new this.classes.ServiceSchemaCollection(serviceSchemas);

    this.ensureValidity(collection);

    this.services.push(...newServices);
  }

  // eslint-disable-next-line class-methods-use-this
  private ensureValidity(collection: ServiceSchemaCollection<D>): void {
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
        `Services ${
          joinCQ(test1.map((s: ServiceSchema<D>) => s.name))
        } have common short names or names`,
      );
    }

    const test2 = collection.getServiceImportsUsingNonExistentIdentifiers();
    const test2Item = test2.find(
      (item) => item.nonExistentIdentifiersUsed.length > 0,
    );

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
}
