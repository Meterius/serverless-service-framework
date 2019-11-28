import { AbstractProvider } from "./abstract-provider";
import { AbstractService } from "./abstract-service";
import { AbstractProviderStack } from "./abstract-provider-stack";
import { AbstractFramework } from "./abstract-framework";
import { AbstractCommonSchema } from "./abstract-common-schema";
import { AbstractServiceSchema } from "./abstract-service-schema";
import { AbstractFrameworkSchema } from "./abstract-framework-schema";
import { AbstractCommonSchemaProperties } from "./abstract-common-schema-properties";
import { AbstractServiceSchemaProperties } from "./abstract-service-schema-properties";
import { AbstractFrameworkSchemaProperties } from "./abstract-framework-schema-properties";
import { AbstractFrameworkActionLogic } from "./abstract-framework-action-logic";
import { FrameworkOptions } from "./framework-options";
import { AbstractServiceSchemaCollection } from "./abstract-service-collection";
import { AbstractServiceDefinition } from "./abstract-service-definition";
import { AbstractFrameworkDefinition } from "./abstract-framework-definition";
import { AbstractServiceHook } from "./abstract-service-hook";
import { AbstractServiceHookMap } from "./abstract-service-hook-map";

export type APD = AbstractProviderDefinition<
any,
AbstractProvider<any, any, any>,
AbstractProviderStack<any, any>,
AbstractCommonSchemaProperties<any>,
AbstractCommonSchema<any>,
AbstractServiceSchemaProperties<any>,
AbstractServiceSchema<any>,
AbstractServiceSchemaCollection<any>,
AbstractService<any>,
AbstractServiceDefinition<any>,
AbstractServiceHook<any>,
AbstractServiceHookMap<any>,
AbstractFrameworkSchemaProperties<any>,
AbstractFrameworkSchema<any>,
AbstractFramework<any>,
AbstractFrameworkDefinition<any>,
AbstractFrameworkActionLogic<any>
>;

export type AbstractProviderDefinition<
  Definition extends APD,
  Provider extends AbstractProvider<Definition, any, any>,
  Stack extends AbstractProviderStack<Definition, any>,
  CommonSchemaProperties extends AbstractCommonSchemaProperties<any>,
  CommonSchema extends AbstractCommonSchema<Definition>,
  ServiceSchemaProperties extends AbstractServiceSchemaProperties<Definition>,
  ServiceSchema extends AbstractServiceSchema<Definition>,
  ServiceSchemaCollection extends AbstractServiceSchemaCollection<Definition>,
  Service extends AbstractService<Definition>,
  ServiceDefinition extends AbstractServiceDefinition<Definition>,
  ServiceHook extends AbstractServiceHook<Definition>,
  ServiceHookMap extends AbstractServiceHookMap<Definition>,
  FrameworkSchemaProperties extends AbstractFrameworkSchemaProperties<Definition>,
  FrameworkSchema extends AbstractFrameworkSchema<Definition>,
  Framework extends AbstractFramework<Definition>,
  FrameworkDefinition extends AbstractFrameworkDefinition<Definition>,
  FrameworkActionLogic extends AbstractFrameworkActionLogic<Definition>,
> = {
  provider: Provider;
  stack: Stack;
  commonSchemaProperties: CommonSchemaProperties;
  commonSchema: CommonSchema;
  serviceSchemaProperties: ServiceSchemaProperties;
  serviceSchema: ServiceSchema;
  serviceSchemaCollection: ServiceSchemaCollection;
  service: Service;
  serviceDefinition: ServiceDefinition;
  serviceHook: ServiceHook;
  serviceHookMap: ServiceHookMap;
  frameworkSchemaProperties: FrameworkSchemaProperties;
  frameworkSchema: FrameworkSchema;
  framework: Framework;
  frameworkDefinition: FrameworkDefinition;
  frameworkActionLogic: FrameworkActionLogic;
};

export type Provider<D extends APD> = D["provider"];

export type Stack<D extends APD> = D["stack"];

export type CommonSchemaProperties<D extends APD> = D["commonSchemaProperties"];

export type CommonSchema<D extends APD> = D["commonSchema"];

export type ServiceSchemaProperties<D extends APD> = D["serviceSchemaProperties"];

export type ServiceSchema<D extends APD> = D["serviceSchema"];

export type ServiceSchemaCollection<D extends APD> = D["serviceSchemaCollection"];

export type Service<D extends APD> = D["service"];

export type ServiceDefinition<D extends APD> = D["serviceDefinition"];

export type ServiceHook<D extends APD> = D["serviceHook"];

export type ServiceHookMap<D extends APD> = D["serviceHookMap"];

export type FrameworkSchemaProperties<D extends APD> = D["frameworkSchemaProperties"];

export type FrameworkSchema<D extends APD> = D["frameworkSchema"];

export type Framework<D extends APD> = D["framework"];

export type FrameworkDefinition<D extends APD> = D["frameworkDefinition"];

export type FrameworkActionLogic<D extends APD> = D["frameworkActionLogic"];

export type CommonSchemaClass<D extends APD> = new (
  baseProps: CommonSchemaProperties<D>, specificProps?: CommonSchemaProperties<D>
) => CommonSchema<D>;

export type ServiceSchemaClass<D extends APD> = new (
  frameworkSchema: FrameworkSchema<D>,
  props: ServiceSchemaProperties<D>,
) => ServiceSchema<D>;

export type FrameworkSchemaClass<D extends APD> = new (
  props: FrameworkSchemaProperties<D>,
  options: FrameworkOptions,
) => FrameworkSchema<D>;

export type ProviderClass<D extends APD> = new (
  framework: Framework<D>
) => Provider<D>;

export type FrameworkActionLogicClass<D extends APD> = new (
  framework: Framework<D>
) => FrameworkActionLogic<D>;

export type ServiceClass<D extends APD> = new (
  framework: Framework<D>,
  props: ServiceSchemaProperties<D>,
  dirPath: string,
  hookMap: ServiceHookMap<D>,
) => Service<D>;

export type ServiceSchemaCollectionClass<D extends APD> = new (
  serviceSchemas: ServiceSchema<D>[],
) => ServiceSchemaCollection<D>;
