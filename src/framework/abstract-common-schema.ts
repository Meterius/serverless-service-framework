import {
  APD, BaseParameter, CommonSchemaProperties,
} from "./abstract-provider-definition";
import {
  ProcessedExportSettings,
  ProcessedImportSettings,
} from "./abstract-common-schema-properties";
import { merge } from "../common/utility";
import { AbstractBase } from "./abstract-base";

export abstract class AbstractCommonSchema<
  D extends APD,
> extends AbstractBase<D> {
  public readonly importSettings: ProcessedImportSettings;

  public readonly exportSettings: ProcessedExportSettings;

  private readonly props: CommonSchemaProperties<D>;

  public constructor(
    base: BaseParameter<D>,
    baseProps: CommonSchemaProperties<D>,
    specificProps?: CommonSchemaProperties<D>,
  ) {
    super(base);

    const props = merge(baseProps, specificProps || {}, true);

    const importSettings = props.importSettings || {};

    this.importSettings = {
      ...importSettings,
      defaultImportType: importSettings.defaultImportType || "direct",
    };

    this.exportSettings = props.exportSettings || {};

    this.props = props;
  }
}
