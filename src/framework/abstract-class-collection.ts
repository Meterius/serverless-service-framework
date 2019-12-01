import {
  APD,
  CommonSchema,
  CommonSchemaProperties,
  Framework,
  FrameworkActionLogic,
  FrameworkDefinition,
  FrameworkSchema,
  FrameworkSchemaProperties,
  Provider,
  Service,
  ServiceDefinition,
  ServiceHookMap,
  ServiceSchema,
  ServiceSchemaCollection,
  ServiceSchemaProperties,
  Stack,
  StackData,
} from "./abstract-provider-definition";
import { FrameworkOptions } from "./framework-options";

export interface AbstractClassCollection<D extends APD> {
  readonly Provider: ProviderClass<D>;
  readonly Stack: StackClass<D>;
  readonly CommonSchema: CommonSchemaClass<D>;
  readonly ServiceSchema: ServiceSchemaClass<D>;
  readonly ServiceSchemaCollection: ServiceSchemaCollectionClass<D>;
  readonly Service: ServiceClass<D>;
  readonly ServiceDefinition: ServiceDefinitionClass<D>;
  readonly FrameworkSchema: FrameworkSchemaClass<D>;
  readonly Framework: FrameworkClass<D>;
  readonly FrameworkDefinition: FrameworkDefinitionClass<D>;
  readonly FrameworkActionLogic: FrameworkActionLogicClass<D>;
}

type CommonSchemaClass<D extends APD> = new (
  baseProps: CommonSchemaProperties<D>, specificProps?: CommonSchemaProperties<D>
) => CommonSchema<D>;

type ServiceSchemaClass<D extends APD> = new (
  frameworkSchema: FrameworkSchema<D>,
  props: ServiceSchemaProperties<D>,
) => ServiceSchema<D>;

type FrameworkSchemaClass<D extends APD> = new (
  props: FrameworkSchemaProperties<D>,
  options: FrameworkOptions,
) => FrameworkSchema<D>;

type ProviderClass<D extends APD> = new (
  framework: Framework<D>
) => Provider<D>;

type FrameworkActionLogicClass<D extends APD> = new (
  framework: Framework<D>
) => FrameworkActionLogic<D>;

type FrameworkClass<D extends APD> = new (
  dirPath: string,
  props: FrameworkSchemaProperties<D>,
  options: FrameworkOptions,
  serviceDefinitions: ServiceDefinition<D>[],
  stage: string,
  profile?: string,
) => Framework<D>;

type FrameworkDefinitionClass<D extends APD> = new (
  dirPath: string,
  props: FrameworkSchemaProperties<D>,
) => FrameworkDefinition<D>;

type StackClass<D extends APD> = new (
  service: Service<D>,
  stackData: StackData<D>,
) => Stack<D>;

type ServiceClass<D extends APD> = new (
  framework: Framework<D>,
  props: ServiceSchemaProperties<D>,
  dirPath: string,
  hookMap: ServiceHookMap<D>,
) => Service<D>;

type ServiceSchemaCollectionClass<D extends APD> = new (
  serviceSchemas: ServiceSchema<D>[],
) => ServiceSchemaCollection<D>;

type ServiceDefinitionClass<D extends APD> = new (
  dirPath: string, props: ServiceSchemaProperties<D>
) => ServiceDefinition<D>;
