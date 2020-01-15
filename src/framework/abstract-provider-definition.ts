import { AbstractProvider } from "./abstract-provider";
import { AbstractService } from "./abstract-service";
import { AbstractStack } from "./abstract-stack";
import { AbstractFramework } from "./abstract-framework";
import { AbstractCommonSchema } from "./abstract-common-schema";
import { AbstractServiceSchema } from "./abstract-service-schema";
import { AbstractFrameworkSchema } from "./abstract-framework-schema";
import { AbstractCommonSchemaProperties } from "./abstract-common-schema-properties";
import { AbstractServiceSchemaProperties } from "./abstract-service-schema-properties";
import { AbstractFrameworkSchemaProperties } from "./abstract-framework-schema-properties";
import { AbstractFrameworkActionLogic } from "./abstract-framework-action-logic";
import { AbstractServiceSchemaCollection } from "./abstract-service-schema-collection";
import { AbstractServiceDefinition } from "./abstract-service-definition";
import { AbstractFrameworkDefinition } from "./abstract-framework-definition";
import { AbstractServiceHookContext, AbstractServiceHookMap } from "./abstract-service-hook";
import { AbstractClassCollection } from "./abstract-class-collection";
import { AbstractBaseCollection } from "./abstract-base-collection";

export type APD = AbstractProviderDefinition<
any,
any,
AbstractClassCollection<any>,
AbstractBaseCollection<any>,
AbstractProvider<any, any, any, any>,
AbstractStack<any, any>,
AbstractCommonSchemaProperties<any>,
AbstractCommonSchema<any>,
AbstractServiceSchemaProperties<any>,
AbstractServiceSchema<any>,
AbstractServiceSchemaCollection<any>,
AbstractService<any>,
AbstractServiceDefinition<any>,
AbstractServiceHookContext<any>,
AbstractServiceHookMap<any>,
AbstractFrameworkSchemaProperties<any>,
AbstractFrameworkSchema<any>,
AbstractFramework<any>,
AbstractFrameworkDefinition<any>,
AbstractFrameworkActionLogic<any>
>;

export type AbstractProviderDefinition<
  InferredStackData extends any,
  Definition extends APD,
  ClassCollection extends AbstractClassCollection<Definition>,
  BaseCollection extends AbstractBaseCollection<Definition>,
  Provider extends AbstractProvider<Definition, any, any, any>,
  Stack extends AbstractStack<Definition, InferredStackData>,
  CommonSchemaProperties extends AbstractCommonSchemaProperties<Definition>,
  CommonSchema extends AbstractCommonSchema<Definition>,
  ServiceSchemaProperties extends AbstractServiceSchemaProperties<Definition>,
  ServiceSchema extends AbstractServiceSchema<Definition>,
  ServiceSchemaCollection extends AbstractServiceSchemaCollection<Definition>,
  Service extends AbstractService<Definition>,
  ServiceDefinition extends AbstractServiceDefinition<Definition>,
  ServiceHookContext extends AbstractServiceHookContext<Definition>,
  ServiceHookMap extends AbstractServiceHookMap<Definition>,
  FrameworkSchemaProperties extends AbstractFrameworkSchemaProperties<Definition>,
  FrameworkSchema extends AbstractFrameworkSchema<Definition>,
  Framework extends AbstractFramework<Definition>,
  FrameworkDefinition extends AbstractFrameworkDefinition<Definition>,
  FrameworkActionLogic extends AbstractFrameworkActionLogic<Definition>,
> = {
  inferredStackData: InferredStackData;

  classCollection: ClassCollection;
  baseCollection: BaseCollection;
  provider: Provider;
  stack: Stack;
  commonSchemaProperties: CommonSchemaProperties;
  commonSchema: CommonSchema;
  serviceSchemaProperties: ServiceSchemaProperties;
  serviceSchema: ServiceSchema;
  serviceSchemaCollection: ServiceSchemaCollection;
  service: Service;
  serviceDefinition: ServiceDefinition;
  serviceHookContext: ServiceHookContext;
  serviceHookMap: ServiceHookMap;
  frameworkSchemaProperties: FrameworkSchemaProperties;
  frameworkSchema: FrameworkSchema;
  framework: Framework;
  frameworkDefinition: FrameworkDefinition;
  frameworkActionLogic: FrameworkActionLogic;
};

export type ClassCollection<D extends APD> = D["classCollection"];

export type BaseCollection<D extends APD> = D["baseCollection"];

export type BaseParameter<D extends APD> = () => BaseCollection<D>;

export type Provider<D extends APD> = D["provider"];

export type ProviderDirectImportValue<D extends APD> =
  Provider<D> extends AbstractProvider<any, any, any, infer DIV> ? DIV : unknown;

export type Stack<D extends APD> = D["stack"];

export type StackData<D extends APD> = D["inferredStackData"];

export type CommonSchemaProperties<D extends APD> = D["commonSchemaProperties"];

export type CommonSchema<D extends APD> = D["commonSchema"];

export type ServiceSchemaProperties<D extends APD> = D["serviceSchemaProperties"];

export type ServiceSchema<D extends APD> = D["serviceSchema"];

export type ServiceSchemaCollection<D extends APD> = D["serviceSchemaCollection"];

export type Service<D extends APD> = D["service"];

export type ServiceDefinition<D extends APD> = D["serviceDefinition"];

export { ServiceHook } from "./abstract-service-hook";

export type ServiceHookContext<D extends APD> = D["serviceHookContext"];

export type ServiceHookMap<D extends APD> = D["serviceHookMap"];

export type FrameworkSchemaProperties<D extends APD> = D["frameworkSchemaProperties"];

export type FrameworkSchema<D extends APD> = D["frameworkSchema"];

export type Framework<D extends APD> = D["framework"];

export type FrameworkDefinition<D extends APD> = D["frameworkDefinition"];

export type FrameworkActionLogic<D extends APD> = D["frameworkActionLogic"];
