import {
  APD,
  FrameworkActionLogic,
  FrameworkSchema,
  Provider,
  Service,
  ServiceDefinition,
  ServiceSchema,
  ServiceSchemaCollection,
  FrameworkSchemaProperties, BaseParameter,
} from "./abstract-provider-definition";
import { FrameworkOptions } from "./framework-options";
import { filterObject } from "../common/utility";
import { AbstractBaseWithFsLocation } from "./abstract-base-with-fs-location";

export abstract class AbstractFramework<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBaseWithFsLocation<D> {
  readonly dirPath: string;

  readonly services: Service<D>[] = [];

  readonly provider: Provider<D>;

  readonly stage: string;

  readonly profile: string | undefined;

  readonly actionLogic: FrameworkActionLogic<D>;

  readonly schema: FrameworkSchema<D>;

  protected constructor(
    base: BaseParameter<D>,
    dirPath: string,
    props: FrameworkSchemaProperties<D>,
    options: FrameworkOptions,
    serviceDefinitions: ServiceDefinition<D>[],
    stage: string,
    profile?: string,
  ) {
    super(base, dirPath, "Framework");

    this.dirPath = dirPath;
    this.stage = stage;
    this.profile = profile;

    this.schema = new this.classes.FrameworkSchema(
      props, options,
    );
    this.actionLogic = new this.classes.FrameworkActionLogic(this);
    this.provider = new this.classes.Provider(this);

    this.services = serviceDefinitions.map(
      (def) => new this.classes.Service(this, def.props, def.dirPath, def.hookMap),
    );

    const collection = new this.classes.ServiceSchemaCollection(this.serviceSchemas);

    this.ensureValidity(collection);
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

    const test5 = collection.getServiceImportsUsingSameName();
    const test5Item = test5.find(({ importsUsingSameName }) => importsUsingSameName.length > 0);

    if (test5Item !== undefined) {
      const duplicatedImportNames: string[] = [];
      test5Item.importsUsingSameName.forEach(([, importValue]) => {
        if (!duplicatedImportNames.includes(importValue.name)) {
          duplicatedImportNames.push(importValue.name);
        }
      });

      throw new Error(
        `Service "${test5Item.schema.name}" has multiple imports using the names ${joinCQ(duplicatedImportNames)}`,
      );
    }

    const test6 = collection.getCyclicImportChains().map((cycle) => cycle.concat([cycle[0]]));

    if (test6.length > 0) {
      const cycleDisplay = test6.length === 1 ? "Cycle" : "Cycles";

      const cycles = joinC(test6
        .map((cycle) => cycle.map((schema) => `"${schema.name}"`).join(" > "))
        .map((str) => `(${str})`));

      throw new Error(
        `Import ${cycleDisplay} ${cycles} found`,
      );
    }
  }
}
