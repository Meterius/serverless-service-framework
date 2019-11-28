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
AbstractFrameworkSchemaProperties<any>,
AbstractFrameworkSchema<any>,
AbstractFramework<any>,
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
  FrameworkSchemaProperties extends AbstractFrameworkSchemaProperties<Definition>,
  FrameworkSchema extends AbstractFrameworkSchema<Definition>,
  Framework extends AbstractFramework<Definition>,
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
  frameworkSchemaProperties: FrameworkSchemaProperties;
  frameworkSchema: FrameworkSchema;
  framework: Framework;
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

export type FrameworkSchemaProperties<D extends APD> = D["frameworkSchemaProperties"];

export type FrameworkSchema<D extends APD> = D["frameworkSchema"];

export type Framework<D extends APD> = D["framework"];

export type FrameworkActionLogic<D extends APD> = D["frameworkActionLogic"];

export type CommonSchemaClass<D extends APD> = new (
  baseProps: CommonSchemaProperties<D>, specificProps?: CommonSchemaProperties<D>
) => CommonSchema<D>;

export type ServiceSchemaClass<D extends APD> = new (
  commonSchemaClass: CommonSchemaClass<D>,
  frameworkSchema: FrameworkSchema<D>,
  props: ServiceSchemaProperties<D>,
) => ServiceSchema<D>;

export type FrameworkSchemaClass<D extends APD> = new (
  commonSchemaClass: CommonSchemaClass<D>,
  props: FrameworkSchemaProperties<D>,
  options: FrameworkOptions,
) => FrameworkSchema<D>;

export type ProviderClass<D extends APD> = new (
  framework: Framework<D>
) => Provider<D>;

export type FrameworkActionLogicClass<D extends APD> = new (
  framework: Framework<D>
) => FrameworkActionLogic<D>;
