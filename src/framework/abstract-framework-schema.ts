import { FrameworkTemplate } from "./templates";
import {
  APD,
  CommonSchema,
  CommonSchemaClass,
  FrameworkSchemaProperties,
} from "./abstract-provider-definition";
import { FrameworkOptions } from "./framework-options";

export abstract class AbstractFrameworkSchema<
  D extends APD, // AbstractProviderDefinition
> {
  public readonly name: string;

  public readonly shortName: string;

  public readonly template: FrameworkTemplate;

  public readonly options: FrameworkOptions;

  public readonly commonSchema: CommonSchema<D>;

  private readonly props: FrameworkSchemaProperties<D>;

  constructor(
    commonSchemaClass: CommonSchemaClass<D>,
    props: FrameworkSchemaProperties<D>,
    options: FrameworkOptions,
  ) {
    this.options = options;
    this.props = props;
    // eslint-disable-next-line new-cap
    this.commonSchema = new commonSchemaClass(props);

    this.name = props.name;
    this.shortName = props.shortName;
    this.template = props.template;
  }

  get region(): string {
    return this.template.provider.region;
  }
}
