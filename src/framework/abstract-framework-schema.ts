import { FrameworkTemplate } from "./templates";
import {
  APD, BaseParameter,
  CommonSchema,
  FrameworkSchemaProperties,
} from "./abstract-provider-definition";
import { FrameworkOptions } from "./framework-options";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractFrameworkSchema<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  readonly name: string;

  readonly shortName: string;

  readonly template: FrameworkTemplate;

  readonly options: FrameworkOptions;

  readonly commonSchema: CommonSchema<D>;

  private readonly props: FrameworkSchemaProperties<D>;

  protected constructor(
    base: BaseParameter<D>,
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
