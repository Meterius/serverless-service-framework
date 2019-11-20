import {
  Intersect, Literal, Record, String, Union,
} from "runtypes";
import { Partial } from "runtypes/lib/types/partial";
import { CommonSchemaProperties, ExportMap, ImportMap } from "./common-schema.runtypes";

import { InlineServiceTemplate } from "../../templates.runtypes";

/*
 * RunTypes
 */

const InlineServiceTemplateProperties = Record({
  template: InlineServiceTemplate,
}).And(Partial({
  templateType: Literal("inline"),
}));

const TemplateProperties = Union(
  InlineServiceTemplateProperties,
);

export const DependencyProperties = Partial({
  importMap: ImportMap,
  exportMap: ExportMap,
});

const BaseProperties = Record({
  name: String,
  shortName: String,
});

const ServiceSchemaSpecificProperties = Intersect(
  BaseProperties, TemplateProperties, DependencyProperties,
);

export const ServiceSchemaProperties = Intersect(
  ServiceSchemaSpecificProperties, CommonSchemaProperties,
);
