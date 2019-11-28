import { APD, CommonSchemaProperties } from "./abstract-provider-definition";
import {
  ProcessedExportSettings,
  ProcessedImportSettings,
} from "./abstract-common-schema-properties";
import { merge } from "../common/utility";

export abstract class AbstractCommonSchema<
  D extends APD,
> {
  public readonly importSettings: ProcessedImportSettings;

  public readonly exportSettings: ProcessedExportSettings;

  private readonly props: CommonSchemaProperties<D>;

  public constructor(
    baseProps: CommonSchemaProperties<D>, specificProps?: CommonSchemaProperties<D>,
  ) {
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
