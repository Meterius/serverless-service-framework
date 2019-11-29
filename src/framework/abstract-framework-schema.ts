import { FrameworkTemplate } from "./templates";
import {
  APD, BaseCollection,
  CommonSchema,
  FrameworkSchemaProperties,
} from "./abstract-provider-definition";
import { FrameworkOptions } from "./framework-options";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractFrameworkSchema<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  public readonly name: string;

  public readonly shortName: string;

  public readonly template: FrameworkTemplate;

  public readonly options: FrameworkOptions;

  public readonly commonSchema: CommonSchema<D>;

  private readonly props: FrameworkSchemaProperties<D>;

  protected constructor(
    base: BaseCollection<D>,
    props: FrameworkSchemaProperties<D>,
    options: FrameworkOptions,
  ) {
    super(base);

    this.props = props;
    this.commonSchema = new this.classes.CommonSchema(props);

    this.options = options;
    this.name = props.name;
    this.shortName = props.shortName;
    this.template = props.template;
  }

  get region(): string {
    return this.template.provider.region;
  }
}
