import { InlineFrameworkTemplate } from "../../templates.types";
import { CommonSchemaProperties } from "./common-schema.types";

/*
 * TypeScript
 */

interface InlineFrameworkTemplateProperties {
  templateType?: "inline";
  template: InlineFrameworkTemplate;
}

type TemplateProperties = InlineFrameworkTemplateProperties;

interface BaseProperties {
  name: string;
  shortName: string;

  serviceRootDir: string;
  tsconfigPath?: string;
}

export type FrameworkSchemaProperties =
  BaseProperties & TemplateProperties & CommonSchemaProperties;
