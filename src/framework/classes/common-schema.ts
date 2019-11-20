import { merge } from "../../common/utility";
import {
  CommonSchemaProperties,
  ImportSettings,
  ExportSettings,
} from "./types/common-schema.types";

/* eslint-disable no-dupe-class-members */

export class CommonSchema implements CommonSchemaProperties {
  public readonly importSettings?: ImportSettings;

  public readonly exportSettings?: ExportSettings;

  private readonly commonSchema: CommonSchemaProperties;

  constructor(commonSchema: CommonSchemaProperties);

  constructor(
    baseCommonSchema: CommonSchemaProperties, specificCommonSchema: CommonSchemaProperties
  );

  constructor(
    baseCommonSchema: CommonSchemaProperties, specificCommonSchema?: CommonSchemaProperties,
  ) {
    const commonSchema = merge(baseCommonSchema, specificCommonSchema || {}, true);

    this.importSettings = commonSchema.importSettings;
    this.exportSettings = commonSchema.exportSettings;
    this.commonSchema = commonSchema;
  }
}
