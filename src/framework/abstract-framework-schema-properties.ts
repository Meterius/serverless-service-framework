import { FrameworkTemplate } from "./templates";
import { APD, CommonSchemaProperties } from "./abstract-provider-definition";

interface BaseProperties {
  name: string;
  shortName: string;

  template: FrameworkTemplate;
}

export type AbstractFrameworkSchemaProperties<
  D extends APD
  > = BaseProperties & CommonSchemaProperties<D>;
